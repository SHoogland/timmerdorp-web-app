import React from 'react';
import { FaCheck } from 'react-icons/fa';
import '../scss/WijkPicker.scss';

// Every option here must be a value the rest of the app understands:
// Settings.tsx maps exactly these keys to a Dutch name and a cookie,
// and _tokens.scss defines a matching `theme-*` class.
export const WIJKEN = [
	{ key: 'blue', label: 'Blauw' },
	{ key: 'green', label: 'Groen' },
	{ key: 'red', label: 'Rood' },
	{ key: 'yellow', label: 'Geel' },
	{ key: 'white', label: 'Wit / EHBO' },
	{ key: 'fuchsia', label: 'Fuchsia' },
];

interface WijkPickerProps {
	/** Currently selected wijk key, if any. */
	value?: string;
	/** Called with the chosen key. Picking is the action: there is no save step. */
	onSelect: (wijk: string) => void;
}

/**
 * The one wijk chooser. Used both by the first-run overlay on Home and by the
 * "Wijk wijzigen" page, which previously had two separate implementations that
 * looked and behaved differently.
 */
const WijkPicker: React.FC<WijkPickerProps> = ({ value, onSelect }) => (
	<div className="wijk-grid">
		{WIJKEN.map(({ key, label }) => (
			<button
				key={key}
				type="button"
				aria-pressed={value === key}
				className={`wijk-option ${key}${value === key ? ' is-current' : ''}`}
				onClick={() => onSelect(key)}
			>
				<span className="wijk-label">{label}</span>
				{value === key && (
					<span className="wijk-check" aria-hidden="true"><FaCheck /></span>
				)}
			</button>
		))}
	</div>
);

export default WijkPicker;
