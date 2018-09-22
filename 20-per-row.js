exports.sort = function (items) {
	return items;
};

exports.placeItems = function (items) {
	var row = 1;
	var col = 1;
	items.forEach(function (item) {
		item.x = (col - 1) * item.width;
		item.y = (row - 1) * item.height;
		if (++col > 20) {
			col = 1;
			row++;
		}
	});
	return items;
};