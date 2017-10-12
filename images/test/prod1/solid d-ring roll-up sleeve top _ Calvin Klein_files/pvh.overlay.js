var O; //Shortcut to Overlay object
var PVHOverlay = O = PVHOverlay ||
{
	construct:function(defaults)
	{
		if(U.isNotNull(defaults)) PVHOverlay._defaults=$.extend(PVHOverlay._defaults,defaults);
	},
	
	init:function()
	{
		PVHOverlay.addDialogTitles();
	},
	
	finalize:function()
	{
		
	},
	
	addDialogTitles:function()
	{
		var title=MessageHelper.messages['ADA_MODAL_LINK_TITLE'];
		$('a[href*="O."],a[href*="Overlay."],[onclick*="O."],[onclick*="Overlay."],.overlayLink').not(U.toAttribute(U.TITLE,title)).attr(U.TITLE,title);
	},
	
	isOpen:function(selector)
	{
		if(selector && O._overlays.length>0)
		{
			var length=0;
			$(O._overlays).each(function()
			{
				if($(this).find(selector).length) length++
			});
			return length>0;
		} else return O._overlays.length>0;
		
		return false;
	},
	
	
	//WARNING: The id isn't available while the plug-in is created/loaded.
	open:function(settingsOrEMSName,autoDestroyOrId,onLoad,onDestroy,keepOthersOpen,onSuccess)
	{
		var settings;
		var autoDestroy;
		
		if(settingsOrEMSName)
		{
			if(typeof settingsOrEMSName==U.STRING)
			{
				autoDestroy=true;
				keepOthersOpen=true;
				var id=typeof autoDestroyOrId==U.STRING ? autoDestroyOrId : null
				settings=$.extend({},PVHOverlay._defaults,{emsName:settingsOrEMSName,id:id});
			} else
			{
				if(settingsOrEMSName.moveUp) settingsOrEMSName.moveDown=false;
				if(settingsOrEMSName.moveDown) settingsOrEMSName.moveUp=false;
				if(autoDestroyOrId==true || (autoDestroyOrId==null && (settingsOrEMSName.emsName || settingsOrEMSName.contentURL))) autoDestroy=true;
				if(keepOthersOpen==null) keepOthersOpen=true;
				settings=$.extend({},PVHOverlay._defaults,settingsOrEMSName);
			}
		}
		
		if(keepOthersOpen!=true)
		{
			if(settings && (settings.$content || settings.contentSelector) && O.isOpen())
			{
				var $overlay=O._overlays[O._overlays.length-1];
				if($overlay)
				{
					$overlay.data('replaceContent')(settings,autoDestroy,onLoad,onDestroy);
					if(settings.id) $overlay.attr(U.ID,settings.id);
					else $overlay.removeAttr(U.ID);
				}
				return;
			} else O.close();
		} else if(O.isOpen()) settings.backgroundOpacity=.5;
		
		if(settings)
		{
			var $overlay=U.$body.overlay(settings,autoDestroy,function()
			{
				PVHOverlay.addDialogTitles();
				if(onLoad instanceof Function) onLoad();
			},onDestroy,function()
			{
				O._overlays.splice(O._overlays.indexOf($overlay),1);
				if(!O.isOpen()) U.enableScrolling();
			},onSuccess);
			
			if(U.isNotNull($overlay))
			{
				if(settings.id) $overlay.attr(U.ID,settings.id);
				
				if(!O.isOpen()) U.disableScrolling();
				O._overlays.push($overlay);
			}
		} else console.debug('PVHOverlay - open was called without the required parameter.');
	},
	
	close:function(bypassSetFocus,forceAutoDestroy)
	{
		var length=O._overlays.length;
		for(var i=0;i<length;i++)
		{
			O._overlays[i].data(U.CLOSE)(bypassSetFocus,forceAutoDestroy);
		}
	},
	
	scrollTo:function(scrollTop,duration)
	{
		var $overlay=O._overlays[O._overlays.length-1];
		if($overlay)
		{
			var $overlayContent=$overlay.find(O.CONTENT_SELECTOR);
			if($overlayContent.length) U.scrollTo(scrollTop,duration,$overlayContent);
		}
	},
	
	SELECTOR:'.pvhOverlay',
	CONTENT_SELECTOR:'.pvhOverlayContent',
	duration:.4,
	_overlays:[],
	_defaults:{showBG:true,backgroundOpacity:.84,showLoadingAnimation:false,hideNonDestroyedContent:true}
};
