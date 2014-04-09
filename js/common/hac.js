(function() {
	var mod,
		define,
		main,
		exp;

	mod = function(dependences, callback) {
		var i,
			mods;

		mods = [];

		for (i=0; i<dependences.length; i++) {
			mods.push(((typeof window === 'undefined') ? module.exports : window.HAC)[dependences[i]]);
		}

		return callback.apply(null, mods);
	};

	define = function(name, dependences, callback) {
		((typeof window === 'undefined') ? module.exports : window.HAC)[name] = mod(dependences, callback);
	};

	main = function(dependences, callback) {
		mod(dependences, callback);
	};

	exp = {
		define: define,
		main: main
	};

	if (typeof window === 'undefined') {
		module.exports = exp;
	} else {
		window.HAC = exp;
	}

})();