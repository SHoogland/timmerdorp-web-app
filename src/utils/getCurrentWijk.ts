const getCurrentWijk = (): string => {
	return localStorage.getItem('wijkName') || 'blue';
};

export default getCurrentWijk;
