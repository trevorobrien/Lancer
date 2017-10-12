//-----------------------------------------------------------------
// Licensed Materials - Property of IBM
//
// WebSphere Commerce
//
// (C) Copyright IBM Corp. 2008, 2014 All Rights Reserved.
//
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with
// IBM Corp.
//-----------------------------------------------------------------

/**
 * @fileOverview This class contains declarations of AJAX services used by the Madisons store pages.
 */

dojo.require("wc.service.common");
dojo.require("dijit.registry");

/**
 * @class This class stores common parameters needed to make the service call.
 */
shoppingActionsServicesDeclarationJS = {
	langId: "-1", /* language of the  store */
	storeId: "", /*numeric unique identifier of the store */
	catalogId: "", /*catalog of the store that is currently in use */

	/**
	 * Sets common parameters used by the services
	 * @param (int) langId The language of the store.
	 * @param (int) storeId The store currently in use.
	 * @param (int) catalogId The catalog of the store currently in use.
	 */
	setCommonParameters:function(langId,storeId,catalogId){
			this.langId = langId;
			this.storeId = storeId;
			this.catalogId = catalogId;
	},
	
	//The maximum value of the select box is changed to the max quantity available in the inventory
	updateQTYDropDown:function(actualQty)
	{
		var $select=$("#quantity_" + $("meta[name='pageId']").attr('content'));
		if($select.children().length>actualQty)
		{
			$option=$select.children('option:gt('+(actualQty-1)+')').detach();
			$select.data('$option',$option);
			$select.children(U.LAST_CHILD).attr(U.SELECTED,U.SELECTED);
			$select.dropkick('sync',true);
		}
	},
	
	//The maximum value of the select box is changed to the max quantity available in the inventory for bundle components
	updateComponentQTYDropDown:function(qtyId,actualQty)
	{
		var $select=$(qtyId);
		if($select.children().length>actualQty)
		{
			$option=$select.children('option:gt('+(actualQty-1)+')').detach();
			$select.data('$option',$option);
			$select.children(U.LAST_CHILD).attr(U.SELECTED,U.SELECTED);
			$select.dropkick('sync',true);
		}
	},
	
	resetQTYDropDown:function()
	{
		var $select=$("#quantity_" + $("meta[name='pageId']").attr('content'));
		var $option=$select.data('$option');
		
		if($option)
		{
			$select.append($option);
			$select.data('$option',null);
			$select.dropkick('sync',true);
		}
	},
	/*
	 * Reset the quantity to max available quantity for bundle components 
	 */
	resetComponentQTYDropDown:function(qtyId)
	{
		var $select=$(qtyId);
		var $option=$select.data('$option');
		
		if($option)
		{
			$select.append($option);
			$select.data('$option',null);
			$select.dropkick('sync',true);
		}
	}
}

	/**
	 * Add an item to a shopping cart in Ajax mode. A message is displayed after
	 * the service call.
	 * @constructor
	 */
	wc.service.declare({
		id: "AddOrderItem",
		actionId: "AddOrderItem",
		url: getAbsoluteURL() + "AjaxRESTOrderItemAdd",
		formId: ""

     /**
     * display a success message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */

		,successHandler: function(serviceResponse) {
			
			dojo.require("dijit.registry");
			MessageHelper.hideAndClearMessage();
			// Do not show this message. When item is added, we open up mini cart to display the currently added item.
			// MessageHelper.displayStatusMessage(storeNLS["SHOPCART_ADDED"]);
			cursor_clear();
			if(shoppingActionsJS){
				
			
				
				var actualQty = '';
	             if (serviceResponse['x_actualQtyAdded'] !== undefined && serviceResponse['x_actualQtyAdded'] != '' ) {
	            	 actualQty = ($.parseJSON(serviceResponse['x_actualQtyAdded']))['1'];
	    			 
	    			 if(actualQty > 0) {
	    				 MessageHelper.displayErrorMessage(MessageHelper.messages["QUANTITY_UNAVAILABLE_ADJUSTED"]);
	    				 shoppingActionsServicesDeclarationJS.updateQTYDropDown(actualQty);
	    			 } else {
	    				 MessageHelper.displayErrorMessage(MessageHelper.messages["QUANTITY_INPUT_NOT_AVAILABLE_ERROR"]);
	    				 showDropdown = false;
	    			 }
	    			 
	    			 addedQuantity = actualQty;
	             }
	             
	 			//DPC - update cart count using WC cookies
	             if(serviceResponse.orderItem != null && serviceResponse.orderItem != null && serviceResponse.orderItem.length > 0)
	            	 MiniCart.updateMiniCart(serviceResponse, actualQty, MiniCart.shouldRedirect());

			}
			if(typeof(ShipmodeSelectionExtJS)!= null && typeof(ShipmodeSelectionExtJS)!='undefined'){
				ShipmodeSelectionExtJS.setOrderItemId(serviceResponse.orderItem[0].orderItemId);
			}
			//WI28095 Tealium - Events
			//WI 29819: CK: Bundles Product added notification only shows 1 product and Mobile bundles are missing alts
			PVHTealium.submitAddToCart(serviceResponse);
			dojo.publish('ProductAddedToCart');
		}
     /**
     * display an error message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */
		,failureHandler: function(serviceResponse) {
			if (serviceResponse.errorMessage) {
				if(serviceResponse.errorMessageKey == "_ERR_MAX_BUYABLE_QTY_EXCEEDED"){
					
					var qty = trim(serviceResponse.errorMessageParam[0]);
					var itemName = trim(serviceResponse.errorMessageParam[1]);
					var replacements = {"{0}":qty,"{1}":itemName};
					var errorString = MessageHelper.messages["_ERR_MAX_BUYABLE_QTY_EXCEEDED"];
					errorMessage = errorString.replace(/{\w+}/g, function(all) {
						   return replacements[all] || all;
						});
					
					MessageHelper.displayErrorMessage(errorMessage);
 				}
				else if(serviceResponse.errorMessageKey == "_ERR_NO_ELIGIBLE_TRADING"){
			 		MessageHelper.displayErrorMessage(storeNLS["ERROR_CONTRACT_EXPIRED_GOTO_ORDER"]);
 				} else if (serviceResponse.errorMessageKey == "_ERR_RETRIEVE_PRICE") {
					var tempString = storeNLS["GENERICERR_MAINTEXT"];
					tempString = dojo.string.substitute(tempString,{0:storeNLS["GENERICERR_CONTACT_US"]});
 					MessageHelper.displayErrorMessage(tempString);
 				} else {
 					MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
 				}
			} 
			else {
				 if (serviceResponse.errorMessageKey) {
					MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
				 }
			}
			
			if(serviceResponse.errorCode){
				dojo.publish("OrderError",serviceResponse);
			}

			cursor_clear();
		}

	}),
	
	/**
	 * Add an item to a shopping cart in Ajax mode. A message is displayed after
	 * the service call.
	 * @constructor
	 */
	wc.service.declare({
		id: "AddBundleOrderItem",
		actionId: "AddBundleOrderItem",
		url: getAbsoluteURL() + "AjaxRESTOrderItemAdd",
		formId: ""

     /**
     * display a success message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */

		,successHandler: function(serviceResponse) {
			
			dojo.require("dijit.registry");
			MessageHelper.hideAndClearMessage();
			// Do not show this message. When item is added, we open up mini cart to display the currently added item.
			// MessageHelper.displayStatusMessage(storeNLS["SHOPCART_ADDED"]);
			cursor_clear();
			if(shoppingActionsJS){
				
				var actualQty = '';
	             if (serviceResponse['x_actualQtyAdded'] !== undefined && serviceResponse['x_actualQtyAdded'] != '' ) {
	            	 actualQty = ($.parseJSON(serviceResponse['x_actualQtyAdded']))['1'];
	    			 
	    			 if(actualQty > 0) {
	    				 MessageHelper.displayErrorMessage(MessageHelper.messages["QUANTITY_UNAVAILABLE_ADJUSTED"]);
	    				 if(categoryDisplayJS){
	    					 var qtyId = "#quantity_" + categoryDisplayJS.addedProductId;
	    					 shoppingActionsServicesDeclarationJS.updateComponentQTYDropDown(qtyId,actualQty);
	    					 categoryDisplayJS.addedProductId = "";
	    				}
	    			 } else {
	    				 MessageHelper.displayErrorMessage(MessageHelper.messages["QUANTITY_INPUT_NOT_AVAILABLE_ERROR"]);
	    				 showDropdown = false;
	    			 }
	    			 
	    			 addedQuantity = actualQty;
	             }
	             
	 			//DPC - update cart count using WC cookies
	             if(serviceResponse.orderItem != null && serviceResponse.orderItem != null && serviceResponse.orderItem.length > 0)
	            	 MiniCart.updateMiniCart(serviceResponse, actualQty, MiniCart.shouldRedirect());

			}
			if(typeof(ShipmodeSelectionExtJS)!= null && typeof(ShipmodeSelectionExtJS)!='undefined'){
				ShipmodeSelectionExtJS.setOrderItemId(serviceResponse.orderItem[0].orderItemId);
			}
			//WI28095 Tealium - Events
			//WI 29819: CK: Bundles Product added notification only shows 1 product and Mobile bundles are missing alts
			PVHTealium.submitAddToCart(serviceResponse);
			dojo.publish('ProductAddedToCart');
		}
     /**
     * display an error message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */
		,failureHandler: function(serviceResponse) {
			if (serviceResponse.errorMessage) {
				if(serviceResponse.errorMessageKey == "_ERR_MAX_BUYABLE_QTY_EXCEEDED"){
					
					var qty = trim(serviceResponse.errorMessageParam[0]);
					var itemName = trim(serviceResponse.errorMessageParam[1]);
					var replacements = {"{0}":qty,"{1}":itemName};
					var errorString = MessageHelper.messages["_ERR_MAX_BUYABLE_QTY_EXCEEDED"];
					errorMessage = errorString.replace(/{\w+}/g, function(all) {
						   return replacements[all] || all;
						});
					
					MessageHelper.displayErrorMessage(errorMessage);
 				}
				else if(serviceResponse.errorMessageKey == "_ERR_NO_ELIGIBLE_TRADING"){
			 		MessageHelper.displayErrorMessage(storeNLS["ERROR_CONTRACT_EXPIRED_GOTO_ORDER"]);
 				} else if (serviceResponse.errorMessageKey == "_ERR_RETRIEVE_PRICE") {
					var tempString = storeNLS["GENERICERR_MAINTEXT"];
					tempString = dojo.string.substitute(tempString,{0:storeNLS["GENERICERR_CONTACT_US"]});
 					MessageHelper.displayErrorMessage(tempString);
 				} else {
 					MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
 				}
			} 
			else {
				 if (serviceResponse.errorMessageKey) {
					MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
				 }
			}
			
			if(serviceResponse.errorCode){
				dojo.publish("OrderError",serviceResponse);
			}

			cursor_clear();
		}

	}),
	
	
	/**
	 * Add an item to a shopping cart in Ajax mode. A message is displayed after
	 * the service call.
	 * @constructor
	 */
	wc.service.declare({
		id: "AddItemWithPartNumber",
		actionId: "AddItemWithPartNumber",
		url: getAbsoluteURL() + "AjaxRESTOrderItemAdd",
		formId: ""

     /**
     * display a success message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */

		,successHandler: function(serviceResponse) {
			
			dojo.require("dijit.registry");
			MessageHelper.hideAndClearMessage();

			cursor_clear();
			
			if(shoppingActionsJS){
				
				var actualQty = '';
	             if (serviceResponse['x_actualQtyAdded'] !== undefined && serviceResponse['x_actualQtyAdded'] != '' ) {
	            	 actualQty = ($.parseJSON(serviceResponse['x_actualQtyAdded']))['1'];
	    			 
	    			 if(actualQty > 0) {
	    				 MessageHelper.displayErrorMessage(MessageHelper.messages["QUANTITY_UNAVAILABLE_ADJUSTED"]);
	    				 shoppingActionsServicesDeclarationJS.updateQTYDropDown(actualQty);
	    			 } else {
	    				 MessageHelper.displayErrorMessage(MessageHelper.messages["QUANTITY_INPUT_NOT_AVAILABLE_ERROR"]);
	    				 showDropdown = false;
	    			 }
	    			 
	    			 addedQuantity = actualQty;
	             }
	             
	 			//DPC - update cart count using WC cookies
	             if(serviceResponse.orderItem != null && serviceResponse.orderItem[0] != null && serviceResponse.orderItem[0].orderItemId != null)
	            	 MiniCart.updateMiniCart(serviceResponse, actualQty);

	             //item add from SP Spot Light Overlay
	             O.close();
	             
	             //refresh items and order summary in cart
	 			 if(dijit.byId('ShopCartDisplay'))
	 				dijit.byId('ShopCartDisplay').refresh();
				
			}
			if(typeof(ShipmodeSelectionExtJS)!= null && typeof(ShipmodeSelectionExtJS)!='undefined'){
				ShipmodeSelectionExtJS.setOrderItemId(serviceResponse.orderItem[0].orderItemId);
			}
			//WI28095 Tealium - Events
			PVHTealium.submitAddToCart(serviceResponse);
			dojo.publish('ProductAddedToCart');
		}
     /**
     * display an error message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */
		,failureHandler: function(serviceResponse) {
			if (serviceResponse.errorMessage) {
				if(serviceResponse.errorMessageKey == "_ERR_MAX_BUYABLE_QTY_EXCEEDED"){
					
					var qty = trim(serviceResponse.errorMessageParam[0]);
					var itemName = trim(serviceResponse.errorMessageParam[1]);
					var replacements = {"{0}":qty,"{1}":itemName};
					var errorString = MessageHelper.messages["_ERR_MAX_BUYABLE_QTY_EXCEEDED"];
					errorMessage = errorString.replace(/{\w+}/g, function(all) {
						   return replacements[all] || all;
						});
					
					MessageHelper.displayErrorMessage(errorMessage);
 				}
				else if(serviceResponse.errorMessageKey == "_ERR_NO_ELIGIBLE_TRADING"){
			 		MessageHelper.displayErrorMessage(storeNLS["ERROR_CONTRACT_EXPIRED_GOTO_ORDER"]);
 				} else if (serviceResponse.errorMessageKey == "_ERR_RETRIEVE_PRICE") {
					var tempString = storeNLS["GENERICERR_MAINTEXT"];
					tempString = dojo.string.substitute(tempString,{0:storeNLS["GENERICERR_CONTACT_US"]});
 					MessageHelper.displayErrorMessage(tempString);
 				} else {
 					MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
 				}
			} 
			else {
				 if (serviceResponse.errorMessageKey) {
					MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
				 }
			}
			
			if(serviceResponse.errorCode){
				dojo.publish("OrderError",serviceResponse);
			}

			cursor_clear();
		}

	}),
	
	/**
	 * Adds a pre-defined dynamic kit to a shopping cart in Ajax mode. A message is displayed after
	 * the service call.
	 * @constructor
	 */
	wc.service.declare({
		id: "AddPreConfigurationToCart",
		actionId: "AddOrderItem",
		url: getAbsoluteURL() + "AjaxRESTOrderAddPreConfigurationToCart",
		formId: ""

     /**
     * display a success message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */

		,successHandler: function(serviceResponse) {
			MessageHelper.hideAndClearMessage();
			cursor_clear();
			if(shoppingActionsJS){
				
				var attributes = document.getElementsByName("attrValue");
			
				var singleSKU = true;
				
				for(var i=0; i<attributes.length; i++){
					if (attributes[i].options.length > 1)
					{
						singleSKU = false;
					}
				}
				
				if (!singleSKU)
				{
					shoppingActionsJS.selectedAttributes = new Object();
					for(var i=0; i<attributes.length; i++){
						if(attributes[i] != null){
							attributes[i].value = "";
							attributes[i].onchange();
						}
					}
				}
			}
			if(typeof(ShipmodeSelectionExtJS)!= null && typeof(ShipmodeSelectionExtJS)!='undefined'){
				ShipmodeSelectionExtJS.setOrderItemId(serviceResponse.orderItemId[0]);
			}
		}
     /**
     * display an error message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */
		,failureHandler: function(serviceResponse) {

			if (serviceResponse.errorMessage) {
			 	if(serviceResponse.errorMessageKey == "_ERR_NO_ELIGIBLE_TRADING"){
			 		MessageHelper.displayErrorMessage(storeNLS["ERROR_CONTRACT_EXPIRED_GOTO_ORDER"]);
 				} else if (serviceResponse.errorMessageKey == "_ERR_RETRIEVE_PRICE") {
					var tempString = storeNLS["GENERICERR_MAINTEXT"];
					tempString = dojo.string.substitute(tempString,{0:storeNLS["GENERICERR_CONTACT_US"]});
 					MessageHelper.displayErrorMessage(tempString);
 				} else {
 					MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
 				}
			} 
			else {
				 if (serviceResponse.errorMessageKey) {
					MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
				 }
			}
			cursor_clear();
		}

	})
