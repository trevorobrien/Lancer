(function($)
{
	//$(selector) is expected to be an element containing 2 divs (.tabs & .panes) that each contain .tab and .pane children
	$.fn.tabs=function()
	{
		var setCurrent=function($tab,$tabs,$selector,$pane)
		{
			if($tab.hasClass(U.DISABLED)) return;
			
			var $currentPane=$selector.data('$current-pane');
			if($currentPane)
			{
				$selector.children('.tabs').children('.current').removeClass('current disabled');
				U.fadeOut($currentPane,{hide:true});
				$currentPane.removeClass('current');
				var hideCallback=$currentPane.data(U.HIDE);
				if(hideCallback instanceof Function) hideCallback();
			}
			
			$tab.addClass('current disabled');
			var tabs=$tabs.toArray();
			var length=tabs.length;
			var tab=$tab.get(0);
			var tabIndex=0;
			for(var i=0;i<length;i++)
			{
				if(tabs[i]==tab)
				{
					tabIndex=i;
					break;
				}
			}
			$currentPane=$($pane.get(tabIndex));
			$selector.data('$current-pane',$currentPane);
			$currentPane.addClass('current');
			$tabs.removeAttr(U.ARIA.SELECTED);
			$tab.attr(U.ARIA.SELECTED, U.TRUE);
			
			U.fadeIn($currentPane,{show:true});
			var showCallback=$currentPane.data(U.SHOW);
			if(showCallback instanceof Function) showCallback();
		};
		
		return this.each(function()
		{
			var $this=$(this);
			var $tabs=$this.children('.tabs').children('.tab');
			var $panes=$this.children('.panes').children('.pane');
			
			$tabs.data('setCurrent',function($tab)
			{
				setCurrent($tab,$tabs,$this,$panes);
			})
			.unbind(U.CLICK).click(function()
			{
				setCurrent($(this),$tabs,$this,$panes);
			})
			.unbind(U.KEY_DOWN).keydown(function(event)
			{
				if(event.keyCode == U.KEYCODE.ENTER || event.keyCode == U.KEYCODE.SPACE){
					event.preventDefault();
					this.click();
				}else if(event.keyCode == U.KEYCODE.LEFT || event.keyCode == U.KEYCODE.RIGHT){
					var tabs=$tabs.toArray();
					var length=tabs.length;
					var tab=this;
					var tabIndex=0;
					var nextIndex=0;
					for(var i=0;i<length;i++)
					{
						if(tabs[i]==tab)
						{
							tabIndex=i;
							break;
						}
					}
					if(event.keyCode == U.KEYCODE.LEFT){
						nextIndex = --tabIndex;
						if(nextIndex == -1)
							nextIndex = length+nextIndex;
					}else{
						nextIndex = ++tabIndex%length;
					}
					tabs[nextIndex].click();
					tabs[nextIndex].focus();
				}
			});
			
			var $first=$tabs.filter(':not(.disabled)').first();
			if($first.length)
			{
				$first.removeClass(U.DISABLED);
				setCurrent($first,$tabs,$this,$panes);
			}
		});
	};
})(jQuery);
