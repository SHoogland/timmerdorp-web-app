const getWijkHexColor = (wijkName: string): string => {
	switch (wijkName) {
		case 'yellow':
			return '#f5e31d';
		case 'red':
			return '#ee0202';
		case 'blue':
			return '#2196f3';
		case 'green':
			return '#43a047';
		default:
			return '#2196f3'; // default fallback to blue
	}
};

export default getWijkHexColor;
