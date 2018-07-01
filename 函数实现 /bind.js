//简易版
Function.prototype.bind = function() {
	var target = this;
	var bindArgs = Array.prototype.slice.call(arguments, 1);
	return function() {
		var callArgs = Array.prototype.slice.call(arguments);
		return target.apply(that, bindArgs.concat(callArgs));
	}
}
