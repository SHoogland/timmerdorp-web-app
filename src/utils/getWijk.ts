const getWijk = async (hutNr: string) => {
	if (!hutNr) return '';
    hutNr = '' + hutNr;

    if (hutNr[0] == '0') {
      return 'Geel';
    } else if (hutNr[0] == '1') {
      return 'Rood';
    } else if (hutNr[0] == '2') {
      return 'Blauw';
    } else if (hutNr[0] == '3') {
      return 'Groen';
    } else {
      return 'Onbekend';
    }
}

export default getWijk;