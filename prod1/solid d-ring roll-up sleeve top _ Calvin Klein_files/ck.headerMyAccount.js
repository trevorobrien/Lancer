var CKHeaderMyAccount = CKHeaderMyAccount ||
{
	construct:function() {},
	
	init : function()
	{
		U.displayUserData();
		
		if(U.isDesktop())
		{
			CKHeaderMyAccount.$loginMenuWrapper=$(CKHeaderMyAccount.LOGIN_WRAPPER_SELECTOR);
			CKHeaderMyAccount.$logoutMenuWrapper=$(CKHeaderMyAccount.LOGOUT_WRAPPER_SELECTOR);
			
			if(U.isNotNull(CKHeaderMyAccount.$loginMenuWrapper))
			{
				CKHeaderMyAccount.$loginMenu=CKHeaderMyAccount.$loginMenuWrapper.children('#loginMenu');
				
				if(U.isTablet())
				{
					$(CKHeaderMyAccount.HEADER_SELECTOR).click(function(event)
					{
						if(!CKHeaderMyAccount.$loginMenu.hasClass(U.OPEN))
						{
							CKHeaderMyAccount._open(CKHeaderMyAccount.$loginMenu);
							
							event.preventDefault();
							event.stopImmediatePropagation();
							
							U.callAfterNextClick(function()
							{
								CKHeaderMyAccount._close(CKHeaderMyAccount.$loginMenu);
							});
						}
					}).mouseleave(function()
					{
						CKHeaderMyAccount._close(CKHeaderMyAccount.$loginMenu);
					});
				} else
				{
					$(CKHeaderMyAccount.HEADER_SELECTOR).mouseenter(function()
					{
						CKHeaderMyAccount._open(CKHeaderMyAccount.$loginMenu);
					});
					
					CKHeaderMyAccount.$loginMenuWrapper.mouseleave(function()
					{
						CKHeaderMyAccount._close(CKHeaderMyAccount.$loginMenu);
					});
					
					$(CKHeaderMyAccount.LOGIN_WRAPPER_SELECTOR).focus(function()
					{
						CKHeaderMyAccount._open(CKHeaderMyAccount.$loginMenu);
					});
					
					$(CKHeaderMyAccount.LOGIN_WRAPPER_SELECTOR).focusout(function(event)
		    		{
		    			if(event.relatedTarget == undefined || $(event.relatedTarget).parents(CKHeaderMyAccount.LOGIN_WRAPPER_SELECTOR).length == 0)
		    			{
		    				CKHeaderMyAccount._close(CKHeaderMyAccount.$loginMenu);
		    			}
			    	});
				}
			} else if(U.isNotNull(CKHeaderMyAccount.$logoutMenuWrapper))
			{
				CKHeaderMyAccount.$logoutMenu=CKHeaderMyAccount.$logoutMenuWrapper.children('#logoutMenu');
				
				if(U.isTablet())
				{
					$(CKHeaderMyAccount.HEADER_SELECTOR).click(function(event)
					{
						if(!CKHeaderMyAccount.$logoutMenu.hasClass(U.OPEN))
						{
							CKHeaderMyAccount._open(CKHeaderMyAccount.$logoutMenu);
							
							event.preventDefault();
							event.stopImmediatePropagation();
							
							U.callAfterNextClick(function()
							{
								CKHeaderMyAccount._close(CKHeaderMyAccount.$logoutMenu);
							});
						}
					}).mouseleave(function()
					{
						CKHeaderMyAccount._close(CKHeaderMyAccount.$logoutMenu);
					});
				} else
				{
					$(CKHeaderMyAccount.HEADER_SELECTOR).mouseenter(function()
					{
						CKHeaderMyAccount._open(CKHeaderMyAccount.$logoutMenu);
					});
					
					CKHeaderMyAccount.$logoutMenuWrapper.mouseleave(function()
					{
						CKHeaderMyAccount._close(CKHeaderMyAccount.$logoutMenu);
					});
					
					$(CKHeaderMyAccount.LOGOUT_WRAPPER_SELECTOR).focus(function()
					{
						CKHeaderMyAccount._open(CKHeaderMyAccount.$logoutMenu);
					});
					
					$(CKHeaderMyAccount.LOGOUT_WRAPPER_SELECTOR).unbind(U.FOCUS_OUT).focusout(function(event)
		    		{
		    			if(event.relatedTarget == undefined || $(event.relatedTarget).parents(CKHeaderMyAccount.LOGOUT_WRAPPER_SELECTOR).length == 0)
		    			{
		    				CKHeaderMyAccount._close(CKHeaderMyAccount.$logoutMenu);
		    			}
			    	});
				}
			}
		}
	},
	
	finalize:function() {},
	
    _open:function($menu)
	{
		if(!$menu.hasClass(U.OPEN))
		{
			U.closeOpenElements();
			$menu.addClass(U.OPEN);
			CKUtil.fadeIn($menu,{delay:true});
		}
	},
	
	_close:function($menu)
	{
		if($menu.hasClass(U.OPEN))
		{
			$menu.removeClass(U.OPEN);
			CKUtil.fadeOut($menu,{killFadeInTween:true});
		}
	},
	
	LOGIN_WRAPPER_SELECTOR: "#loginMenuWrapper",
	LOGOUT_WRAPPER_SELECTOR: "#logoutMenuWrapper",
	HEADER_SELECTOR: ".headerMyAccount",
	$loginMenuWrapper:null,
	$logoutMenuWrapper:null,
	$loginMenu:null,
	$logoutMenu:null
}
