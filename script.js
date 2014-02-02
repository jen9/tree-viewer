function find(selector) {
    return document.querySelector(selector);
}

function findAll(selector) {
    return document.querySelectorAll(selector);
}

function addEvent(elem, type, handler){
    if(document.addEventListener){
        elem.addEventListener(type, handler, false);
    } else {
        elem.attachEvent('on' + type, handler);
    }
}

function removeEvent(elem, type, handler){
    if(document.removeEventListener){
        elem.removeEventListener(type, handler);
    } else {
        elem.detachEvent('on' + type, handler);
    }
}
function removeClass(el, classname){
    var class_list = el.className.split(' ');
    if (class_list.length){
        for (var i=0; i < class_list.length; i++){
            if (class_list[i] == classname){
                    class_list.splice(i,1);
                    break;
            }
        }
    }
    el.className = class_list.join(" "); 
}

function addClass(el, classname){
    if (el.className.indexOf(classname) == -1){
        var newClassName = el.className + " " + classname;
    }
    el.className = newClassName;
}

function createObj(dom){
    var obj = {};

    for (var el = 0; el < dom.childNodes.length; el++){
        var value = dom.childNodes[el].getElementsByClassName('title')[0].innerHTML;
        obj[value] = {};
        
        if (dom.childNodes[el].getElementsByTagName('ul').length){
            obj[value] = arguments.callee(dom.childNodes[el].getElementsByTagName('ul')[0]);
        }
    }
    return obj;
}

var tree = (function(window){
	var treeView = {

    	'buildTree' : function(obj){
    		var ul = document.createElement('ul');

    		//custom dom structure: li>span>span+a
    		for(key in obj){
    		    var li 		= document.createElement('li'),
    		    	span1 	= document.createElement('span'),
    		    	span2 	= document.createElement('span'),
    		    	a  		= document.createElement('a');

    		    a.innerHTML = key;
    		    a.className = 'title';
    		    span2.className = 'connector';
    		    span1.appendChild(span2);
    		    span1.appendChild(a);
    		    li.appendChild(span1);

    		    if (Object.keys(obj[key]).length){
    		      li.className = 'open';
    		      li.appendChild(arguments.callee(obj[key]));
    		    }
    		    ul.appendChild(li);
    		}
    		document.getElementById('tree').appendChild(ul);
    		return ul;
    	},


    	'collapse' : function(event){
    		var event = event || window.event,
    		    target = event.target || event.srcElement,
    		    li = target.parentNode.parentNode;
    		if (target.className.match(/(?:^|\s)connector(?!\S)/) == null){
                return;
            }
    		if (li.getElementsByTagName('ul')[0]){
    			if (li.className.indexOf('open') !== -1){
    				removeClass(li, 'open');
    				addClass(li, 'close');
    			} else {
    				removeClass(li, 'close');
    				addClass(li, 'open');
    			}
    		}
    		var ul = li.getElementsByTagName('ul')[0];
    		ul.style.display = ul.style.display ? '' : 'none';
    	},


    	'check_highlighted' : function(event){
    		var event = event || window.event,
    		    target = event.target;
            if (target.tagName !== "A"){
                return;
            }
    		if(find('#highline') && find('#highline') !== target){
    			var el = find('#highline');
    			el.id = el.id.replace(/\bhighline\b/,'');
    		}
    	},


    	'highlighted' : function(event){
    		treeView.check_highlighted(event);
            var event = event || window.event,
                target = event.target,
    		    additional_form = find('#add-node'),
                additional_form_input = document.getElementById('add-node_text');
            if (target.nodeName !== "A"){
                return;
            }
            if(target.id.match(/(?:^|\s)highline(?!\S)/) !== null){
    			target.id = target.id.replace(/\bhighline\b/,'');
            } else{
            	target.id += 'highline';
            }

            if(find('#highline')){
                additional_form_input.value = '';
            	additional_form.style.display = 'block';
    		} else {
    			additional_form.style.display = 'none';
    		}
            event.preventDefault();
    	},


    	'add_node' : function(event){
    		var el = find('#highline'),
    		    li = document.createElement('li'),
    		    span1 = document.createElement('span'),
    		    span2 = document.createElement('span'),
    		    a = document.createElement('a'),
    		    text = document.getElementById('add-node_text'),
    		    next = el.parentNode.parentNode.nextSibling;

    		if (text.value !== ""){
                span2.className = 'connector';
    		    a.className = 'title';
    		    a.href = '#';
    		    a.innerHTML = text.value;
    		    window.node_value = text.value;
                span1.appendChild(span2);
                span1.appendChild(a);
                li.appendChild(span1);
                target = el;
                el.parentNode.parentNode.parentNode.insertBefore(li, next);

                  var tree = treeView.localStorage.read('tree');
                  var arr = [];
                  var node = el;
                  arr.unshift(text.value);
                  node = node.parentNode.parentNode.parentNode;

                  while (node.parentNode !== document.getElementById('tree')){
                     if (node.tagName == "LI"){
                        arr.unshift(node.getElementsByTagName('a')[0].innerHTML);
                     }
                     node = node.parentNode;
                  }
                  text.value = '';
                  treeView.localStorage.triggerStore();
            } else {
                alert("Plese enter new value")
            }
    	},


        'context_menu': {

            'init': function(event){
                target = event.target || event.srcElement;
                event.preventDefault();
                var context_menu    = document.getElementById('context-menu'),
                    rename_link     = document.getElementById('rename-link'),
                    delete_link     = document.getElementById('delete-link'),
                    create_link     = document.getElementById('create-link');

                addEvent(rename_link, 'click', treeView.context_menu.rename_click);
                addEvent(create_link, 'click', Modal.init);
                addEvent(delete_link, 'click', treeView.context_menu.delete_click);

                if(target.tagName !== 'A') return;
                context_menu.style.left = (event.pageX + scrollX) + 'px';
                context_menu.style.top = (event.pageY + scrollY) + 'px';

                context_menu.style.display = 'block';
                addEvent(document, 'click', treeView.context_menu.hide);
            },


            'hide': function(){
                var context_menu    = document.getElementById('context-menu'),
                    rename_link     = document.getElementById('rename-link'),
                    delete_link     = document.getElementById('delete-link'),
                    create_link     = document.getElementById('create-link');
                removeEvent(rename_link, 'click', treeView.context_menu.rename_click);
                removeEvent(create_link, 'click', treeView.context_menu.create_click);
                removeEvent(delete_link, 'click', treeView.context_menu.delete_click);
                context_menu.style.display = 'none';
                removeEvent(document, 'click', treeView.context_menu.hide);
            },


            'rename_click': function(e){
                var input       = document.createElement('input'),
                    span        = target.parentNode;
                e.preventDefault();
                if(target.tagName !== 'A') return;

                input.id = 'new-value';
                input.value = target.innerHTML;
                span.replaceChild(input, target);
                var input_field = document.getElementById('new-value');
                input_field.focus();
                window.node_value = target.innerHTML;
                addEvent(input_field, 'keypress', treeView.context_menu.rename_blur);
            },


            'rename_blur': function(e){
                if (e.keyCode ==13){
                    var a = document.createElement('a');
                    a.innerHTML = this.value;
                    a.className = 'title';
                    var span = this.parentNode;
                    span.replaceChild(a, this);
                    treeView.localStorage.triggerStore();
                }
            },


            'delete_click': function(){
                var tree    = treeView.localStorage.read('tree'),
                    arr     = [],
                    additional_form = find('#add-node'),
                    li = target.parentNode.parentNode,
                    parent = li.parentNode.parentNode,
                    parent_ul = li.parentNode,
                    parent_title = parent.getElementsByClassName('title');

                li.parentNode.removeChild(li);

                if (!parent_ul.children.length) {
                    removeClass(parent, 'open');
                }
                treeView.localStorage.triggerStore();
            },


            'create_click': function(){
                var ul      = document.createElement('ul'),
                    li      = document.createElement('li'),
                    span1   = document.createElement('span'),
                    span2   = document.createElement('span'),
                    a       = document.createElement('a'),
                    el      = target.parentNode.parentNode;

                var data = this.getElementsByTagName('input')[0].value;

                if (data !== ""){
                    var tree = treeView.localStorage.read('tree');

                    span2.className     = 'connector';
                    a.className         = 'title';
                    a.href              = '#';
                    a.innerHTML         = data;
                    window.node_value = a.innerHTML;
                    span1.appendChild(span2);
                    span1.appendChild(a);
                    li.appendChild(span1);
                    if (el.getElementsByTagName('ul').length == 0){
                        addClass(el, 'open');
                        ul.appendChild(li);
                        el.appendChild(ul);
                    } else {
                        var place = el.getElementsByTagName('ul')[0];
                        place.appendChild(li);
                    }
                    treeView.localStorage.triggerStore();
                    Modal.hide();
                } else {
                    alert('Please enter node value');
                }
            }
        },


        'localStorage': {
            'isSupport': function(){
                try {
                    return 'localStorage' in window && window['localStorage'] !== null;
                } catch (e) {
                    return false;
                }
            },
            'read': function(el){
                return JSON.parse(localStorage.getItem(el));
            },
            'set': function(el, value){
                localStorage.setItem(el, JSON.stringify(value));
                // treeView.init();
            },
            'hasItem': function(el){
                try{
                    return localStorage.getItem(el) !== null
                } catch(e) {
                    return false;
                }
            },
            'triggerStore': function(){
                var tree = createObj(treeUL);
                treeView.localStorage.set('tree', tree);
            }
        }

    }

    var Modal = {

        'init': function() {
            var m = document.getElementById('modal');
            m.style.display = 'block';
            var close = m.getElementsByClassName('close')[0],
                f = document.getElementById('modal-form'),
                text = f.getElementsByTagName('input')[0];
            text.focus();
            addEvent(close, 'click', Modal.hide);
            addEvent(f, 'submit', treeView.context_menu.create_click);
        },


        'hide': function() {
            var modalW = document.getElementById('modal'),
                close = modalW.getElementsByClassName('close')[0],
                f = document.getElementById('modal-form'),
                text = f.getElementsByTagName('input')[0];
            modalW.style.display = 'none';
            text.value = '';
            removeEvent(close, 'click', Modal.hide);
            removeEvent(f, 'submit', Modal.hide);
            removeEvent(f, 'submit', treeView.context_menu.create_click);
        }
    }


    return {
        
        'init': function(){
            var tree = {"one":{"two":{"three":{"thrasdee":{}, "fouffffr":{}}, "four":{}, "five":{"asd":{}, "fodasdur":{}}}},"six":{},"seven":{"eight":{}, "nine":{}}};

            if(treeView.localStorage.isSupport()){
                if (!treeView.localStorage.hasItem('tree')){
                    treeView.localStorage.set('tree', tree);
                }
                tree = find('#tree');
                tree.innerHTML = '';
                treeView.buildTree(treeView.localStorage.read('tree'));
                treeUL = find('#tree>ul');
            } else {
                treeView.buildTree(tree);
            }

            addEvent(treeUL, 'click', treeView.collapse);
            addEvent(treeUL, 'click', treeView.highlighted);
            
            var form_node = document.getElementById('add-node');
            addEvent(form_node, 'submit', treeView.add_node);
            form_node.style.display = 'none';

            addEvent(treeUL, 'contextmenu', treeView.context_menu.init);
        }
    }

})(window);

tree.init();