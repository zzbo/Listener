/**
 * @file 消息中心组件<br />
 * @version 1.1.0.20130524
 * @author zhenbo.zheng
 */

;(function () {
	/**
	 * @desc 主题类
	 * @type {Class}
	 * @param {String} 归属的主题名
	 * @param {Object} 主题对象集合
	 * @returns {Object} Subject Object
	 */
	function Subject (subName, subNameSpace, data) {
		this.subName = subName;
		this.subNameSpace = subNameSpace;

		this.allowSuccessFlag = true;
		this.allowErrorFlag = true;

		this.hasSuccess =  subNameSpace[subName]['hasSuccess'] || false;
		this.hasError = subNameSpace[subName]['hasError'] || false;
		this.callbacks = {
			'onsuccess' : new Callbacks(),
			'onerrors' : new Callbacks()
		};

		this.data = data || {};
	}

	Subject.prototype = {
		/**
	     * 成功时执行的事件
	     * @method
	     * @access public
	     * @param {Function} 订阅成功时执行的事件
	     * @returns {Object} Subject Object
	     */
		onsuccess : function(callbackFunc) {
			this._when('onsuccess', callbackFunc);
			return this;
		},
		/**
	     * 错误时执行的事件
	     * @method
	     * @access public
	     * @param {Function} 订阅错误时执行的事件
	     * @returns {Object} Subject Object
	     */
		onerror : function(callbackFunc) {
			this._when('onerrors', callbackFunc);
			return this;
		},
		/**
	     * 触发事件
	     * @method
	     * @access public
	     * @param {String} 要触发的事件类型
	     */
		trigger : function (type, data) {
			var callbacks = this.callbacks,
				that = this;

			switch(type) {
				case 'onsuccess':
					status = 'hasSuccess';
					break;
				case 'onerrors':
					status = 'hasError';
					break;
				default:
					break;
			}

			that[status] = true;
			if (that[status] && this.allowSuccessFlag) {
				callbacks[type].fire(data);
			}
		},
		/**
	     * 取消触发事件
	     * @method
	     * @access public
	     * @param {String} 要触发的事件类型('success'或'error')
	     */
		unsub : function (type) {
			switch (type) {
				case 'success':
					this.allowSuccessFlag = false;
					break;
				case 'error':
					this.allowErrorFlag = false;
					break;
				default:
					this.allowSuccessFlag = false;
					this.allowErrorFlag = false;
			}
		},
		/**
	     * 取消触发事件
	     * @method
	     * @access private
	     * @param {String} 要触发的事件类型('onsuccess'或'onerrors')
	     * @param {Function} 要触发的事件
	     */
		_when : function (type, callbackFunc) {
			var callbacks = this.callbacks,
				status,
				allow,
				that = this;
	  
			switch(type) {
				case 'onsuccess':
					callbacks['onsuccess'].add(callbackFunc);
					status = 'hasSuccess';
					allow = 'allowSuccessFlag';
					break;
				case 'onerrors':
					callbacks['onerrors'].add(callbackFunc);
					status = 'hasError';
					allow = 'allowErrorFlag';
					break;
				default:
					break;
			}

			//检测订阅之前，是否有执行过
			var deps = that.subName.split(',');
			var doneCount = 0;
			var extData = {};
			for (var i = 0, len = deps.length; i < len; i++) {
				if (that.subNameSpace[deps[i]] && that.subNameSpace[deps[i]][status] == true) {
					extData = $.extend(extData, that.subNameSpace[deps[i]]['data'][type]);
					doneCount++;
				}
			}

			//如果已经主题发布，则立即执行
			if (doneCount == len && that[allow]) {
				callbackFunc(extData);
			}

		}
	}

	/**
	 * 事件类(可惜jQuery里的$.callbacks没list返回, 在此实现简易callbacks)
	 * @method
	 * @access public
	 */
	function Callbacks() {
		this.list = [];
	}

	Callbacks.prototype = {
		/**
		 * 添加事件到队列
		 * @method
		 * @access public
		 * @param {Function} 要触发的事件
		 */
		add : function(func) {
			var list = this.list;
			var type = Object.prototype.toString.call(func) === '[object Function]';
			for (var i = 0, len = list.length + 1; i < len; i++) {
				if (type && func != list[i]) {
					list.push(func);
				}
			}
		},
		/**
		 * 执行事件
		 * @method
		 * @access public
		 */
		fire : function() {
			var list = this.list;
			var args = arguments;
			for (var i = 0, len = list.length; i < len; i++) {
				list[i].apply(null, args);
			}
		}
	}

	$.Listener = {
		/**
	     * @desc 组件版本号
	     * @type {Number}
	     */
		version : '1.0.1.20130109',
		/**
	     * @desc 主题集合的命名空间
	     * @type {Object}
	     * @default {}
	     */
		subNameSpace : {},
		hasPubList : [],
		subNameList : [],
		/**
	     * 订阅主题
	     * @method
	     * @access public
	     * @param {String} 主题名
	     * @returns {Object} Subject Object
	     */
		sub : function (subName) {
			if (typeof subName != 'string') {return;}

			var subNameSpace = this.subNameSpace,
				 _t = Math.floor(Math.random()*new Date().getTime()+1),
				 args = Array.prototype.slice.call(arguments),
				 subjectObj;

			subName = args.join(',');
			if (!subNameSpace[subName]) {
				subNameSpace[subName] = {
					subNameList : {}
				};
			}

			subjectObj = new Subject(subName, subNameSpace, subNameSpace[subName].data);
			subjectObj['_t'] = _t;
			subNameSpace[subName]['subNameList']['subjectObj_' + _t] = subjectObj;

			return subjectObj;
		},
		/**
	     * 兼容处理
	     * @method
	     * @access private
	     * @param {String} 主题名
	     * @param {String} 事件类型('onsuccess'或'onerros')
	     */
		_facade : function(subName, type, data) {
			var subNameSpace = this.subNameSpace,
				hasState;

			switch(type){
				case 'onsuccess':
					hasState = 'hasSuccess';
					break;
				case 'onerrors':
					hasState = 'hasError';
					break;
				default:
					break;
			}

			!subNameSpace[subName]['data'] && (subNameSpace[subName]['data'] = {});
			subNameSpace[subName]['data'][type] = $.extend({}, subNameSpace[subName]['data'][type], data);

			//标记已发布状态
			subNameSpace[subName][hasState] = true;

			//加入已发布队列
			if ($.inArray(subName, this.hasPubList) == -1) {
				this.hasPubList.push(subName);
			}

			//[subName]['subNameList']
			for (var i in subNameSpace) {
				var arr = i.split(',');
				var len = count = arr.length;
				var extData = {};

				if ($.inArray(subName, arr) != -1) {
					for (var j = 0; j < len; j++) {
						if ($.inArray(arr[j], this.hasPubList) != -1) {
							extData = $.extend(extData, subNameSpace[arr[j]]['data'][type]);
							count--;
						}
					}
					
					if (count == 0) {
						for (var k in subNameSpace[i]['subNameList']) {
							subNameSpace[i]['subNameList'][k].trigger(type, extData);		
						}
					}
				}
			}
		},
		/**
	     * 发布事件
	     * @method
	     * @access public
	     * @param {String} 主题名
	     * @returns {Object} 返回状态的操作方法集
	     */
		pub : function (subName)  {
			var subNameSpace = this.subNameSpace,
				callbackType,
				args = Array.prototype.slice.call(arguments),
				that = this;

			for (var i = 0, len = args.length; i < len; i++) {
				subName = args[i];
				if (!subNameSpace[subName]) {
					//若主题不存在，则创建;
					subNameSpace[subName] = {
						subNameList : {}
					};
				}
			}

			return {
				success : function (data) {
					for (var i = 0, len = args.length; i < len; i++) {
						that._facade(args[i], 'onsuccess', data);
					}
					return this;
				},
				error : function (data) {
					for (var i = 0, len = args.length; i < len; i++) {
						that._facade(args[i], 'onerrors', data);	
					}
					return this;
				}
			}
		},
		/**
	     * 取消发布事件
	     * @method
	     * @access public
	     * @param {String} 主题名
	     * @returns {Object} 返回状态的操作方法集
	     */
		unsub : function (subName) {
			var subNameSpace = this.subNameSpace,
				facade;

			if (subNameSpace[subName]) {
				facade = function (type, key) {
					if (key) {
						var _t = key._t;
						var subjectObj = subNameSpace[subName]['subNameList']['subjectObj_' + _t];
						subjectObj.unsub(type);
					}
					else {
						for (var i in subNameSpace[subName]['subNameList']) {
							subNameSpace[subName]['subNameList'][i].unsub(type);
						}
					}
				}

				return {
					success : function (key) {
						facade('success', key);
						return this;
					},
					error : function (key) {
						facade('error', key);
						return this;
					},
					all : function () {
						facade();
						return this;
					}
				}
			}
		}
	}
});
