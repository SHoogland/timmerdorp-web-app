const getWijkHexColor = (wijkName: string): string => {
	switch (wijkName) {
		case 'yellow':
			return '#ffd60a'; // keep in sync with --yellow in _tokens.scss
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
