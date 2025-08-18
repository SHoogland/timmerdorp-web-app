const getCurrentWijk = (): string => {
	return localStorage.getItem('wijk') || 'blue';
};

export default getCurrentWijk;
