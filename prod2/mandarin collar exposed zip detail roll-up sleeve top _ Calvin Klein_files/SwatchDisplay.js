SwatchDisplayJS = {

	activeWaist : null,
	activeLength : null,
	activeColor : null,
	activeColorName: null,
	activeSize : null,
	lastChanged : null,
	productId : null,
	sizeJSON : null,
	colorJSON : null,
	mode : null,
	colorToColorCodeMapJSON : null,
	colorAttrIdentifier : null,
	fireTealium:true,
	init : function(productId)
	{
		this.lastChanged = 'color';
		this.productId = productId;
		this.colorJSON = this.loadJSON("colorJSON");
		this.sizeJSON = this.loadJSON("sizeJSON");
		this.colorToColorCodeMapJSON = this.loadJSON("colorToColorCodeMapJSON");
	},
	
	setColorAttrIdentifier : function(colorAttrIdentifier) {
		this.colorAttrIdentifier = colorAttrIdentifier;
	},
	
	setActiveWaist : function(id, changeQuantity) {
		// changeQuantity argument used only in bundle swatches
		if (this.isSizeDisabled(id))
			return;
		if (this.activeWaist == id) {
			this.reset();
			return;
		}
		this.deactivateSize(this.activeWaist);
		this.activeWaist = id;
		this.activateSize(this.activeWaist);
		this.lastChanged = 'waist';
		this.refeshProductDisplay();
		MessageHelper.clearAllErrorMessages();
		
		/* reset add to wish list link */
		SwatchDisplayJS.resetWishListLink();

	},
	setActiveLength : function(id, changeQuantity) {
		// changeQuantity argument used only in bundle swatches
		if (this.isSizeDisabled(id))
			return;
		if (this.activeLength == id) {
			this.reset();
			return;
		}
		this.deactivateSize(this.activeLength);
		this.activeLength = id;
		this.activateSize(this.activeLength);
		this.lastChanged = 'length';
		this.refeshProductDisplay();
		MessageHelper.clearAllErrorMessages();
		
		/* reset add to wish list link */
		SwatchDisplayJS.resetWishListLink();

	},
	setActiveColor : function(id) {
		if (this.isColorDisabled(id))
			return;
		if (this.activeColor == id)
		{
			$(function()
			{
				if(!U.isBundlePage() || typeof PVHAltImages!=U.UNDEFINED) PVHAltImages.resetSelectedAlt();
			});
			
			return;
		}
		this.deactivateColor(this.activeColor);
		this.activeColor = id;
		this.activateColor(this.activeColor);
		var $swatch=$("#"+id);
		
		$(function()
		{
			if(typeof PVHAltImages!=U.UNDEFINED) PVHAltImages.update($swatch.data('color-code'));
		});
		
		this.lastChanged = 'color';
		this.refeshProductDisplay();
		MessageHelper.clearAllErrorMessages();
		
		/* reset add to wish list link */
		SwatchDisplayJS.resetWishListLink();

	},
	setActiveSize : function(id, changeQuantity) {
		// changeQuantity argument used only in bundle swatches
		if (this.isSizeDisabled(id))
			return;
		if (this.activeSize == id) {
			// Do not allow user to deselect when there is only one size available
			if(this.sizeJSON.colorToSize[this.activeColorName].length <= 1)
				return;
			this.reset();
			return;
		}
		this.deactivateSize(this.activeSize);
		this.activeSize = id;
		this.activateSize(this.activeSize);
		this.lastChanged = 'size';
		this.refeshProductDisplay();
		MessageHelper.clearAllErrorMessages();
		U.removeSizeSelectorError(); //JP:TODO: Needed for split sizes
		
		/* reset add to wish list link */
		SwatchDisplayJS.resetWishListLink();

	},
	activateSize : function(id) {
		if (this.notNull(id)) {
			dojo.query('#' + id).addClass('selected').attr(U.ARIA.CHECKED, U.TRUE);
		}
	},
	deactivateSize : function(id) {
		if (this.notNull(id)) {
			dojo.query('#' + id).removeClass('selected').attr(U.ARIA.CHECKED, U.FALSE);
		}
	},
	activateColor : function(id) {
		if (this.notNull(id)) {
			dojo.query('#' + id).addClass('active').attr(U.ARIA.CHECKED, U.TRUE);
		}
	},
	deactivateColor : function(id) {
		if (this.notNull(id)) {
			dojo.query('#' + id).removeClass('active').attr(U.ARIA.CHECKED, U.FALSE);
		}
	},
	disableSize : function(id) {
		if (this.notNull(id)) {
			var e = dojo.query('#' + id);
			e.addClass('disabled');
			e.removeAttr(U.TAB_INDEX);
			e.removeClass('available');
		}
	},
	enableSize : function(id) {
		if (this.notNull(id)) {
			var e = dojo.query('#' + id);
			e.removeClass('disabled');
			e.attr(U.TAB_INDEX, 0);
			e.addClass('available');
		}
	},
	disableColor : function(id) {
		if (this.notNull(id)) {
			var e = dojo.query('#' + id);
			e.addClass('disabled');
			e.removeAttr(U.TAB_INDEX);
		}
	},
	enableColor : function(id) {
		if (this.notNull(id)) {
			var e = dojo.query('#' + id);
			e.removeClass('disabled');
			e.attr(U.TAB_INDEX, 0);
		}
	},
	isSizeDisabled : function(id) {
		if (this.notNull(id))
			return dojo.hasClass(id, 'disabled');
		return false;
	},
	isColorDisabled : function(id) {
		if (this.notNull(id))
			return dojo.hasClass(id, 'disabled');
		return false;
	},
	
	resetWishListLink : function()
	{
		$('#productPageAdd2Wishlist').css('display','');
		$('#addedToWishlist, #pageLevelMessage').hide();
	},

	buildSizeId : function(val, type) {
		/* Fix for sizes with a decimal 9460 */
		// val = val.replace(".", "-");
		// val = val.replace(/\s/g, "-");
		val = U.addUnderscoreEncoding(val);
		return 'size_' + type + '_' + val;
	},
	// this function not used anymore - should be removed
	buildColorId : function(val) {
		if (this.mode == 'QuickView')
			return 'swatch_catentry_' + val;
		return 'catentry_' + val;
	},
	findJSONByColor : function(color) {
		for ( var i in this.colorJSON.colors) {
			var item = this.colorJSON.colors[i];
			if (item === color)
				return item;
		}
		return null;
	},
	disableSizes : function(sizes, type) {
		dojo.forEach(sizes, function(item) {
			var id = SwatchDisplayJS.buildSizeId(item, type);
			SwatchDisplayJS.disableSize(id);
		});
	},
	enableSizes : function(sizes, type) {
		if( Object.prototype.toString.call( sizes ) === '[object Array]' ) {
			dojo.forEach(sizes, function(item) {
				var id = SwatchDisplayJS.buildSizeId(item, type);
				SwatchDisplayJS.enableSize(id);
			});
		}
		else{
			for ( var size in sizes) {
				var id = this.buildSizeId(size, type);
				this.enableSize(id);
			}
		}
	},
	disableColors : function(colorJSON) {
		if(colorJSON.colors) {
			dojo.forEach(colorJSON.colors, function(color) {
				var $li = $('[data-color-swatch="' + color + '"]');
				//RJUN-21 SP - Size Out Display Change on PDP
				// For QV, the colors weren't getting disabled for both TH & SP stores as the color variable above will 
				// be present across multiple products. So for QV we take the last one from the colors array as the QV will be loaded 
				// loaded last in the DOM.
				if($li.length){
					var id;
					if ($li.length ==1){
						id = $li[0].id;
					}else {
						id = $li[$li.length-1].id;
					}
					SwatchDisplayJS.disableColor(id);
				}
			});
		}
	},
	enableColors : function(colors) {

		dojo.forEach(colors, function(color) {
			var $li = $('[data-color-swatch="' + color + '"]');
			//RJUN-21 SP - Size Out Display Change on PDP
			// For QV, the colors weren't getting disabled for both TH & SP stores as the color variable above will 
			// be present across multiple products. So for QV we take the last one from the colors array as the QV will be loaded 
			// loaded last in the DOM.
			if($li.length){
				var id;
				if ($li.length ==1){
					id = $li[0].id;
				}else {
					id = $li[$li.length-1].id;
				}
					
				SwatchDisplayJS.enableColor(id);
			}
		});

	},
	
	loadJSON : function(id) {
		if (this.notNull(id)) return eval('(' + $('#'+id).html() + ')');
		return null;
	},
	
	//clearActiveColor - Used by QV to fully reset SwatchDisplayJS. Otherwise, it would return early, because activeColor was still set.
	reset : function(clearActiveColor)
	{

		this.deactivateSize(this.activeSize);
		this.deactivateSize(this.activeLength);
		this.deactivateSize(this.activeWaist);
		this.activeSize = null;
		this.activeLength = null;
		this.activeWaist = null;
		this.lastChanged = 'color';
		
		if(clearActiveColor) this.activeColor=null;

		/* Clear out any values that may have been set in categoryDisplayJS */
		categoryDisplayJS.setSelectedAttribute(this.colorAttrIdentifier, U.EMPTY);
		categoryDisplayJS.setSelectedAttribute("Size", U.EMPTY);
		categoryDisplayJS.setSelectedAttribute("Color", U.EMPTY);

		dojo.query('ul.productswatches li').removeClass('disabled').attr(U.TAB_INDEX, 0);

		this.refeshProductDisplay();

	},
	refeshProductDisplay : function() {

		if (!this.notNull(this.productId))
			return;
		
		if (!this.sizeJSON) return; //30266: Prevents an error when OOS QV is closed

		var size = null, color = null, waist = null, length = null, colorCode = null;

		if (this.notNull(this.activeLength)) {
			length = dojo.query('#' + this.activeLength + ' span')[0].innerHTML;
		}

		if (this.notNull(this.activeWaist)) {
			waist = dojo.query('#' + this.activeWaist + ' span')[0].innerHTML;
		}

		if (this.notNull(length) && this.notNull(waist)) {
			size = waist + '/' + length;
		}

		if (this.notNull(this.activeSize)) {
			size = dojo.query('#' + this.activeSize + ' span')[0].innerHTML;
		}

		if (this.notNull(this.activeColor)) {
			color = dojo.query('#' + this.activeColor + ' a img')[0];
			if (this.notNull(color)){
				color = color.title;
				this.activeColorName = color;
			} else {
				color = null;
				this.activeColor = null;
			}
		}

		if (this.notNull(color)) {
			var colorLbl = dojo.byId('colorValue');
			colorLbl.innerHTML = color;
		}

		/**
		 * Handle for non split sizes
		 */
		if (!this.sizeJSON.split) {

			if (this.lastChanged == 'color' && this.notNull(color)) {
				this.disableSizes(this.sizeJSON.sizes, 'S');
				var sizesToEnable = this.sizeJSON.colorToSize[color];
				this.enableSizes(sizesToEnable, 'S');
				//WI 28095 Tealium - Events
				//WI 28865 Tealium - Utag.link call for color change should not be made on PDP page load.
				if (SwatchDisplayJS.fireTealium)
				{
					PVHTealium.submitColorChange(color);					
				}else{
					SwatchDisplayJS.fireTealium = true;
				}
			} else if (this.lastChanged == 'size' && this.notNull(size) && U.isFeatureEnabled(U.DISABLE_OOS_SWATCHES)) {
				this.disableColors(this.colorJSON);
				var colorsToEnable = this.sizeJSON.sizeToColor[size];
				this.enableColors(colorsToEnable);
				// WI 28095 Tealium - Events
				PVHTealium.submitSizeChange(size);
			}
			
		} else { /* handle split sizes */
			
			if (this.lastChanged == 'waist' && this.notNull(waist) && U.isFeatureEnabled(U.DISABLE_OOS_SWATCHES)) {
				// WI 28095 Tealium - Events
				PVHTealium.submitSizeChange(waist);
				/* need to update color and length */
				this.disableColors(this.colorJSON);
				var colorsToEnable = Object.keys(this.sizeJSON.waistToColorAndLength[waist].colors);
				this.enableColors(colorsToEnable);

				this.disableSizes(this.sizeJSON.lengths, 'L');
				var sizesToEnable = this.sizeJSON.waistToColorAndLength[waist].colors[color];
				this.enableSizes(sizesToEnable, 'L');

			} else if (this.lastChanged == 'length' && this.notNull(length) && U.isFeatureEnabled(U.DISABLE_OOS_SWATCHES)) {
				// WI 28095 Tealium - Events
				PVHTealium.submitSizeChange(length);
				/* need to update color and waist */
				this.disableColors(this.colorJSON);
				var colorsToEnable = Object.keys(this.sizeJSON.lengthToColorAndWaist[length].colors);
				this.enableColors(colorsToEnable);

				this.disableSizes(this.sizeJSON.waists, 'W');
				var sizesToEnable = this.sizeJSON.lengthToColorAndWaist[length].colors[color];
				this.enableSizes(sizesToEnable, 'W');

			} else if (this.lastChanged == 'color' && this.notNull(color)) {
				/* need to update waist and length */
				this.disableSizes(this.sizeJSON.waists, 'W');
				var sizesToEnable = null;

				if (this.notNull(length)) {
					sizesToEnable = this.sizeJSON.colorToWaistAndLength[color].lengths[length];
				} else {
					sizesToEnable = this.sizeJSON.colorToWaistAndLength[color].waists;
				}
				this.enableSizes(sizesToEnable, 'W');

				this.disableSizes(this.sizeJSON.lengths, 'L');
				var sizesToEnable = null;

				if (this.notNull(waist)) {
					sizesToEnable = this.sizeJSON.colorToWaistAndLength[color].waists[waist];
				} else {
					sizesToEnable = this.sizeJSON.colorToWaistAndLength[color].lengths;
				}

				this.enableSizes(sizesToEnable, 'L');
			
			}
		}

		/* Check if we have a disabled value selected */
		if (this.isSizeDisabled(this.activeSize)) {
			this.deactivateSize(this.activeSize);
			this.activeSize = null;
			size = null;
		} else if (this.isSizeDisabled(this.activeLength)) {
			this.deactivateSize(this.activeLength);
			this.activeLength = null;
			size = null;
			this.refeshProductDisplay();
			return;
		} else if (this.isSizeDisabled(this.activeWaist)) {
			this.deactivateSize(this.activeWaist);
			this.activeWaist = null;
			size = null;
			this.refeshProductDisplay();
			return;
		} else if (this.isColorDisabled(this.activeColor)) {
			this.deactivateColor(this.activeColor);
			this.activeColor = null;
			color = null;
		}

		if(this.notNull(color))
		{
			colorCode = this.colorToColorCodeMapJSON[color];
		}
		if (this.notNull(size) && this.notNull(colorCode) && this.notNull(this.productId)) {
			categoryDisplayJS.setSelectedAttribute(this.colorAttrIdentifier, colorCode);
			categoryDisplayJS.setSelectedAttribute("Size", size);
			categoryDisplayJS.setSelectedAttribute("Color", color);
			if(productDisplayJS){
				productDisplayJS.setSelectedAttribute(this.colorAttrIdentifier, colorCode,"entitledItem_"+this.productId);
				productDisplayJS.setSelectedAttribute("Size", size,"entitledItem_"+this.productId);
				productDisplayJS.setSelectedAttribute("Color", color,"entitledItem_"+this.productId);
			}
			categoryDisplayJS.changePrice("entitledItem_" + this.productId, false, true);
		} else {
			categoryDisplayJS.setSelectedAttribute(this.colorAttrIdentifier, U.EMPTY);
			categoryDisplayJS.setSelectedAttribute("Color", U.EMPTY);
			categoryDisplayJS.setSelectedAttribute("Size", U.EMPTY);
			if(productDisplayJS){
				productDisplayJS.setSelectedAttribute(this.colorAttrIdentifier, U.EMPTY,"entitledItem_"+this.productId);
				productDisplayJS.setSelectedAttribute("Color", U.EMPTY);
				productDisplayJS.setSelectedAttribute("Size", U.EMPTY);
			}
		}

		if(U.isMobile()) U.updateSwatchContainerWidth();
		if(typeof shoppingActionsServicesDeclarationJS!=U.UNDEFINED) shoppingActionsServicesDeclarationJS.resetQTYDropDown();
	},
	notNull : function(val) {
		if (typeof val != U.UNDEFINED && val != U.EMPTY && val != null)
			return true;
		else
			return false;
	},
	updateCatEntryDisplay : function(caller, targetId, imagePath, itemUrl, container) {

		var con = dojo.byId(targetId);
		con.href = itemUrl;

		var img = con.children[0];
		img.src = imagePath;

		dojo.query('#' + container + ' ul li').removeClass('active');

		dojo.query('#' + caller).addClass('active');

	},

	updateColorProductDisplay : function(caller)
	{
		this.setActiveColor(caller);
	},
	
	updateSizeProductDisplay : function(caller, size, productId) {
		
		this.setActiveSize(caller);
	},
	
	toggle : function(target) {
		if (dojo.byId(target).style.display == "none") {
			dojo.byId(target).style.display = "block";
		} else {
			dojo.byId(target).style.display = "none";
		}
	}
}
