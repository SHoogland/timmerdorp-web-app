import { useEffect, useRef, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import am4themes_kelly from '@amcharts/amcharts4/themes/kelly';
import LoadingIcon from '../components/LoadingIcon';
import { FaSyncAlt } from 'react-icons/fa';
import '../scss/Statistics.scss';

function Statistics() {
	const [statistieken, setStatistieken] = useState<any>({});
	const [showChildCountGraph, setShowChildCountGraph] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [isLoadingGraphData, setIsLoadingGraphData] = useState(true);
	const [admins, setAdmins] = useState<any[]>([]);
	const [wijken, setWijken] = useState<string[]>(['yellow', 'red', 'blue', 'green', 'hutlozen']);
	const chartRef = useRef(null);


	const wijkNameMap: { [key: string]: string } = {
		yellow: 'geel',
		red: 'rood',
		blue: 'blauw',
		green: 'groen',
	}
	const toSentenceCase = (str: string) => str[0].toUpperCase() + str.slice(1);

	const wijkprops = [
		{ title: "Totaal aantal kinderen", prop: "count" },
		{ title: "Aanwezig di", prop: "aanwezig_di" },
		{ title: "Aanwezig wo", prop: "aanwezig_wo" },
		{ title: "Aanwezig do", prop: "aanwezig_do" },
		{ title: "Aanwezig vr", prop: "aanwezig_vr" }
	];

	const allprops = [
		{ title: "Totaal aantal kinderen", prop: "count" },
		{ title: "Aantal kinderen met hutnummer", prop: "haveHutnr" },
		{ title: "Aantal kinderen met armbandje", prop: "haveWristband" }
	];

	useEffect(() => {
		const fetchData = async () => {
			try {
				const wijk = await localStorage.getItem('wijkName') || 'yellow';
				const sortedWijken = ['yellow', 'red', 'blue', 'green', 'hutlozen'].sort((w) => (wijk === w ? -1 : 1));
				setWijken(sortedWijken);
				await updateData();
			} catch (error) {
				console.error("Error loading data:", error);
			}
		};

		fetchData();
	}, []);

	const animationListener = () => {
		if (!isLoadingStats && !isLoadingGraphData) setIsRefreshing(false);
	};

	useEffect(() => {

		document.querySelector('button.fab.sticky svg')?.addEventListener('animationiteration', animationListener);

		return () => {
			document.querySelector('button.fab.sticky svg')?.removeEventListener('animationiteration', animationListener);
		};
	}, [isLoadingStats, isLoadingGraphData]);

	const updateData = async () => {
		setIsLoadingStats(true);
		setIsLoadingGraphData(true);

		const wijkStats = await apiCall('wijkStats');
		if (wijkStats && wijkStats.response === 'success') {
			setStatistieken(wijkStats);
			setAdmins(wijkStats.adminList.sort((a: any, b: any) => b.total - a.total).filter((a: any) => a.total));
			setIsLoadingStats(false);
		}

		const presencesByTime = await apiCall('getPresencesByTime', { day: 'sat' })
		parseGraphData(presencesByTime);
	};

	const parseGraphData = (result: any) => {
		if (result.response !== 'success') return;

		let entries = result.entries.sort((a: any, b: any) => (a.h !== b.h ? a.h - b.h : a.m - b.m));
		if (!entries.length || entries[0] == null) {
			setShowChildCountGraph(false);
			setIsLoadingGraphData(false);
			return
		}

		entries = expandEntries(entries);

		const isConsecutive = (a: any, b: any) => a.minute === 59 ? ((b.hour == a.hour + 1) && b.minute === 0) : (a.hour === b.hour && b.minute === a.minute + 1)

		// if i.e. there is only an entry for 11:22 and 11:24, also fill them up to have 11:23 (with the same amount as 11:22)
		for (let i = 0; i < entries.length - 1; i++) {
			if (!isConsecutive(entries[i], entries[i + 1])) {
				const newEntry = {
					hour: entries[i].hour,
					minute: entries[i].minute + 1,
					total: entries[i].total,
					yellow: entries[i].yellow,
					red: entries[i].red,
					blue: entries[i].blue,
					green: entries[i].green,
				}
				if (+entries[i].minute === 59) {
					newEntry.hour = entries[i].hour + 1
					newEntry.minute = 0
				}
				entries.splice(i + 1, 0, newEntry) // voeg nieuwe entry toe aan entries
			}
		}


		am4core.useTheme(am4themes_animated);
		am4core.useTheme(am4themes_kelly);
		am4core.options.autoDispose = true;

		if (!chartRef.current) throw new Error('chartRef is not set');
		const chart = am4core.create(chartRef.current, am4charts.XYChart);
		chart.marginRight = 400;


		chart.marginRight = 400;
		const data = []
		const prependZero = (x: number) => (x < 10 ? '0' + x : x)

		for (let i = 0; i < entries.length; i++) {
			if (i === 0) {
				let m = entries[i].minute - 1
				let h = entries[i].hour
				if (entries[i].minute === 0) {
					h--
					m = 59
				}
				data.push({
					t: prependZero(h) + ':' + prependZero(m),
					v: 0,
					y: 0,
					r: 0,
					b: 0,
					g: 0,
				})
			}
			data.push({
				t: prependZero(entries[i].hour) + ':' + prependZero(entries[i].minute),
				v: entries[i].total,
				y: entries[i].yellow,
				r: entries[i].red,
				b: entries[i].blue,
				g: entries[i].green,
			})
		}

		if (result.currentTime) {
			const lastEntry = data[data.length - 1]
			if (+result.currentTime.replace(':', '') > +lastEntry.t.replace(':', '')) {
				// add an entry for the current time, which has the same values as the last entry
				data.push({
					t: result.currentTime,
					v: lastEntry.v,
					y: lastEntry.y,
					r: lastEntry.r,
					b: lastEntry.b,
					g: lastEntry.g,
				})
			}
		}

		chart.data = data

		createAxes(chart);
		createSeries(chart);

		chart.legend = new am4charts.Legend();
		chart.legend.position = "bottom";

		setIsLoadingGraphData(false);
	};

	const expandEntries = (entries: any[]) => {
		const firstEntry = {
			hour: entries[0].h,
			minute: entries[0].m,
			yellow: entries[0].y,
			red: entries[0].r,
			blue: entries[0].b,
			green: entries[0].g,
			total: entries[0].t,
		}
		const expandedEntries = [firstEntry]
		for (let i = 1; i < entries.length; i++) {
			const previousEntry = expandedEntries[i - 1]
			const entry = entries[i]
			expandedEntries.push({
				hour: entry.h,
				minute: entry.m,
				yellow: previousEntry.yellow + (entry.y || 0),
				red: previousEntry.red + (entry.r || 0),
				blue: previousEntry.blue + (entry.b || 0),
				green: previousEntry.green + (entry.g || 0),
				total: previousEntry.total + (entry.t || 0),
			})
		}
		return expandedEntries;
	};

	const createAxes = (chart: any) => {
		const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "t";
		categoryAxis.title.text = "Tijdstip";

		const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.title.text = "Aantal kinderen";
	};

	const createSeries = (chart: any) => {
		const seriesList = [
			{ name: 'Geel', key: 'y', color: '#fce700' },
			{ name: 'Rood', key: 'r', color: '#ee0202' },
			{ name: 'Blauw', key: 'b', color: '#2196f3' },
			{ name: 'Groen', key: 'g', color: '#43a047' }
		];

		seriesList.forEach(seriesData => {
			const series = chart.series.push(new am4charts.LineSeries());
			series.dataFields.valueY = seriesData.key;
			series.dataFields.categoryX = "t";
			series.name = `Wijk ${seriesData.name}`;
			series.stroke = am4core.color(seriesData.color);
			series.fill = am4core.color(seriesData.color);
			series.fillOpacity = 0.4;
			series.strokeWidth = 2;
			series.stacked = true;
			series.tensionX = 0.8;
			series.tensionY = 1;
		});

		const totalSeries = chart.series.push(new am4charts.LineSeries());
		totalSeries.dataFields.valueY = "v";
		totalSeries.stroke = am4core.color('#000');
		totalSeries.dataFields.categoryX = "t";
		totalSeries.name = "Totaal aantal kinderen";
		totalSeries.strokeWidth = 3;
		totalSeries.tensionX = 0.8;
		totalSeries.tensionY = 1;
	};

	const refreshData = () => {
		setIsRefreshing(true);
		updateData();
	};

	return (
		<Layout title="Statistieken" noPadding={true}>
			{(isLoadingStats || isLoadingGraphData) && !isRefreshing && (
				<div id="spinner">
					<LoadingIcon />
				</div>
			)}
			<div className={(isLoadingStats && !isRefreshing) ? 'hidden' : ''}>
				<h2>Aanwezigheid per wijk</h2>
				<table className="left-column-fixed withHeader">
					<tbody>
						<tr>
							<td></td>
							<td style={{ textAlign: 'center' }}>Totaal</td>
							{wijken.map((wijk, index) => (
								<td key={index} style={{ textAlign: 'center' }}>
									{toSentenceCase(wijkNameMap[wijk] || wijk)}
								</td>
							))}
						</tr>
						{wijkprops.map((p, index) => (
							<tr key={index}>
								<td style={{ minWidth: '150px' }}>{p.title}</td>
								<td style={{ textAlign: 'center' }}>{statistieken[p.prop] || ' – '}</td>
								{wijken.map((w) => (
									<td key={w} style={{ textAlign: 'center' }}>
										{statistieken[w]?.[p.prop] || ' – '}
									</td>
								))}
							</tr>
						))}
						{allprops.map((p, index) => (
							<tr key={index}>
								<td style={{ minWidth: '150px' }}>{p.title}</td>
								<td style={{ textAlign: 'center' }}>{statistieken[p.prop] || ' – '}</td>
								{wijken.map((w) => (
									<td key={w} style={{ textAlign: 'center' }}>
										–
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className={((isLoadingGraphData && !isRefreshing) || !showChildCountGraph) ? 'hidden' : ''}>
				<h2>Aantal kinderen op het terrein</h2>
				<div id="presencesByTimeChart" ref={chartRef}></div>
			</div>

			<div className={(isLoadingStats && !isRefreshing) ? 'hidden' : ''}>
				<h2>Aanwezigheidstrijd</h2>
				<p style={{ padding: "4px 18px", fontWeight: "bold" }}>
					Hieronder zie je wie er de meeste kinderen aanwezig heeft gemeld.
				</p>
				<div style={{ overflowX: 'scroll' }}>
					<table className='cleanTable withHeader top-column-fixed'>
						<tbody>
							<tr>
								<td style={{ minWidth: '150px' }}>
									Naam
								</td>
								<td>
									Dinsdag
								</td>
								<td>
									Woensdag
								</td>
								<td>
									Donderdag
								</td>
								<td>
									Vrijdag
								</td>
								<td>
									Totaal
								</td>
							</tr>
							{admins.map((admin, index) => (
								<tr key={index} className={admin.isYou ? 'isYou' : ''}>
									<td className={admin.wijk}>{admin.naam}</td>
									<td>{admin.di || 0} </td>
									<td>{admin.wo || 0} </td>
									<td>{admin.do || 0} </td>
									<td>{admin.vr || 0} </td>
									<td>{admin.total || 0} </td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<button type="button" title="verversen" className="fab sticky bottom-right" onClick={refreshData}>
				<FaSyncAlt className={isRefreshing ? 'isRotating' : ''} />
			</button>
		</Layout>
	);
}

export default Statistics;