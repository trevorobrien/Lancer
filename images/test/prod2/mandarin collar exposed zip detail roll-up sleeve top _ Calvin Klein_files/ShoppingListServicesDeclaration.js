//-----------------------------------------------------------------
// Licensed Materials - Property of IBM
//
// WebSphere Commerce
//
// (C) Copyright IBM Corp. 2011, 2015 All Rights Reserved.
//
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with
// IBM Corp.
//-----------------------------------------------------------------

/** 
 * @fileOverview This javascript is used by the wish list pages to handle CRUD operations.
 * @version 1.0
 */

/**
 * This REST service allows customers to create a new shopping list
 * @constructor
 */
wc.service.declare({
	id:"ShoppingListServiceCreate",
	actionId:"ShoppingListServiceCreate",
	url: getAbsoluteURL() + "AjaxRestWishListCreate",
	formId:""

	 /**
     * Hides all the messages and the progress bar.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,successHandler: function(serviceResponse) {
		cursor_clear();
		closeAllDialogs();	//close the create popup
		
		dojo.topic.publish('ShoppingList_Changed', {listId: serviceResponse.uniqueID, listName: serviceResponse.descriptionName, action: 'add'});
	}
		
	/**
     * display an error message.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,failureHandler: function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} 
		else {
			 if (serviceResponse.errorMessageKey) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
			 }
		}
		cursor_clear();
	}			
}),

/**
 * This REST service allows customers to update the name of a shopping list
 * @constructor
 */
wc.service.declare({
	id:"ShoppingListServiceUpdate",
	actionId:"ShoppingListServiceUpdate",
	url:getAbsoluteURL() + "AjaxRestWishListUpdate",
	formId:""

	 /**
     * Hides all the messages and the progress bar.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,successHandler: function(serviceResponse) {
		cursor_clear();
		closeAllDialogs();
		shoppingListJS.showMessageDialog(storeNLS['LIST_EDITED']);
		
		dojo.topic.publish('ShoppingList_Changed', {listId: serviceResponse.uniqueID, listName: serviceResponse.descriptionName, action: 'edit'});
	}
		
	/**
     * display an error message.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,failureHandler: function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} 
		else {
			 if (serviceResponse.errorMessageKey) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
			 }
		}
		cursor_clear();
	}			
}),

/**
 * This REST service allows customers to delete a selected shopping list
 * @constructor
 */
wc.service.declare({
	id:"ShoppingListServiceDelete",
	actionId:"ShoppingListServiceDelete",
	url:getAbsoluteURL() + "AjaxRestWishListDelete",
	formId:""

	 /**
     * Hides all the messages and the progress bar.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,successHandler: function(serviceResponse) {
		cursor_clear();			
		closeAllDialogs();
		shoppingListJS.showMessageDialog(storeNLS['LIST_DELETED']);
		
		dojo.topic.publish('ShoppingList_Changed', {listId: serviceResponse.uniqueID, listName: '', action: 'delete'});
	}
		
	/**
     * display an error message.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,failureHandler: function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} 
		else {
			 if (serviceResponse.errorMessageKey) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
			 }
		}
		cursor_clear();
	}			
}),

/**
 * This REST service allows customers to add an item to a shopping list
 * @constructor
 */
wc.service.declare({
	id:"ShoppingListServiceAddItem",
	actionId:"ShoppingListServiceAddItem",
	url:getAbsoluteURL() + "AjaxRestWishListCreateWithItemExt",
	formId:""

	 /**
     * Hides all the messages and the progress bar.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,successHandler: function(serviceResponse) {
		cursor_clear();
		
		if(serviceResponse.status == 'addedToWishList') {
		
			if(dojo.byId('productPageAdd2Wishlist') && dojo.byId('addedToWishlist')) {
				dojo.byId('productPageAdd2Wishlist').style.display = 'none';
				dojo.byId('addedToWishlist').style.display = 'block';
			
			} else  {
				dojo.topic.publish("ShoppingListItem_Added");
			}
		
		} else if(serviceResponse.status == 'itemExistsInWishList') {
			MessageHelper.displayErrorMessage(storeNLS['SL_ITEM_ALREADY_ADDED']);
		
		} else {
			MessageHelper.displayErrorMessage(storeNLS['SL_FAILED_TO_ADD_ITEM']);
		} 
	}
		
	/**
     * display an error message.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,failureHandler: function(serviceResponse) {
		
		if(serviceResponse.errorMessageKey && serviceResponse.errorMessageKey == '_ERR_RULE_EVALUATION_FAILED.2001.WishList') {
			MessageHelper.displayErrorMessage(MessageHelper.messages["SL_ITEM_ALREADY_ADDED"]);
			
		} else if (serviceResponse.errorMessage) {
			
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		
		}  else if (serviceResponse.errorMessageKey) {
		
			MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
		}
		cursor_clear();
	}			
}),

/**
 * This REST service allows customers to add an bundle component to a shopping list
 * @constructor
 */
wc.service.declare({
	id:"ShoppingListServiceAddBundleItem",
	actionId:"ShoppingListServiceAddBundleItem",
	url:getAbsoluteURL() + "AjaxRestWishListCreateWithItemExt",
	formId:""

	 /**
     * Hides all the messages and the progress bar.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,successHandler: function(serviceResponse) {
		cursor_clear();
		
		if(serviceResponse.status == 'addedToWishList') {
			var productPageAdd2WishlistId = "productPageAdd2Wishlist_" + shoppingListJS.addedComponentIndex;
			var addedToWishlistId = "addedToWishlist_" + shoppingListJS.addedComponentIndex;
			
			if(dojo.byId(productPageAdd2WishlistId) && dojo.byId(addedToWishlistId)) {
				dojo.byId(productPageAdd2WishlistId).style.display = 'none';
				dojo.byId(addedToWishlistId).style.display = 'block';
			} else  {
				dojo.topic.publish("ShoppingListItem_Added");
			}
			shoppingListJS.addedComponentIndex = "";
		} else if(serviceResponse.status == 'itemExistsInWishList') {
			MessageHelper.displayErrorMessage(storeNLS['SL_ITEM_ALREADY_ADDED']);
		
		} else {
			MessageHelper.displayErrorMessage(storeNLS['SL_FAILED_TO_ADD_ITEM']);
		} 
	}
		
	/**
     * display an error message.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,failureHandler: function(serviceResponse) {
		
		if(serviceResponse.errorMessageKey && serviceResponse.errorMessageKey == '_ERR_RULE_EVALUATION_FAILED.2001.WishList') {
			MessageHelper.displayErrorMessage(MessageHelper.messages["SL_ITEM_ALREADY_ADDED"]);
			
		} else if (serviceResponse.errorMessage) {
			
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		
		}  else if (serviceResponse.errorMessageKey) {
		
			MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
		}
		cursor_clear();
	}			
}),

/**
 * This REST service allows customers to remove an item from a shopping list
 * @constructor
 */
wc.service.declare({
	id:"ShoppingListServiceRemoveItem",
	actionId:"ShoppingListServiceRemoveItem",
	url:getAbsoluteURL() + "AjaxRestWishListRemoveItem",
	formId:""

	 /**
     * Hides all the messages and the progress bar.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,successHandler: function(serviceResponse) {
		cursor_clear();			
		MessageHelper.hideAndClearMessage();
		MessageHelper.displayStatusMessage(MessageHelper.messages["WISHLIST_REMOVEITEM"]);
	}
		
	/**
     * display an error message.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,failureHandler: function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} 
		else {
			 if (serviceResponse.errorMessageKey) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
			 }
		}
		cursor_clear();
	}			
}),
	
/**
 * This REST service allows customers to add an item to a shopping list and remove from the shopping cart
 * @constructor
 */
wc.service.declare({
	id:"ShoppingListServiceAddItemAndRemoveFromCart",
	actionId:"ShoppingListServiceAddItemAndRemoveFromCart",
	url:getAbsoluteURL() + "AjaxRestWishListCreateWithItemExt",
	formId:""

	/**
	 * Hides all the messages and the progress bar.
	 * @param (object) serviceResponse The service response object, which is the
	 * JSON object returned by the service invocation.
	 */
	,successHandler: function(serviceResponse) {
		cursor_clear();
		// NBC - 32 CKTH: Error is not getting thrown when trying to move a product from Shopping Bag Page or PDP to wishlist which is already present in the wishlist
		if(serviceResponse.status == 'addedToWishList') {
			dojo.topic.publish("ShoppingListItem_Added");
		}
		else if(serviceResponse.status == 'itemExistsInWishList') {
				MessageHelper.displayErrorMessage(MessageHelper.messages["SL_ITEM_ALREADY_ADDED"]);
		}
		else {
				MessageHelper.displayErrorMessage(storeNLS['SL_FAILED_TO_ADD_ITEM']);
		} 
	}
			
	/**
	 * display an error message.
	 * @param (object) serviceResponse The service response object, which is the
	 * JSON object returned by the service invocation.
	 */
	,failureHandler: function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} 
		else {
			 if (serviceResponse.errorMessageKey) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
			 }
		}
		cursor_clear();
	}			
}),

/**
* This REST service allows customers to set a wish list as the default list
* @constructor
* 
**/
wc.service.declare({
	id:"AjaxGiftListServiceChangeGiftListStatus",
	actionId:"AjaxGiftListServiceChangeGiftListStatus",
	url:getAbsoluteURL() + "AjaxRestWishListChangeState",
	formId:""

	 /**
     * Hides all the messages and the progress bar.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,successHandler: function(serviceResponse) {
		cursor_clear();			
		MessageHelper.hideAndClearMessage();

		MultipleWishLists.updateDefaultListName('multipleWishListButton',serviceResponse.descriptionName);		
		MultipleWishLists.updateDefaultListName('addToMultipleWishListLink',serviceResponse.descriptionName);
		MultipleWishLists.setDefaultListId(serviceResponse.uniqueID);
		MultipleWishLists.updateContextPostSwitch(serviceResponse.uniqueID);
	}
		
	/**
     * display an error message.
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation.
     */
	,failureHandler: function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} 
		else {
			 if (serviceResponse.errorMessageKey) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
			 }
		}
		cursor_clear();
	}			
}),

	/**
	 * This REST service sends the wish list to a specified email address.
	 */
	wc.service.declare({
		id: "AjaxGiftListAnnouncement",
		actionId: "AjaxGiftListAnnouncement",
		url: getAbsoluteURL() + "AjaxRESTWishListAnnounce",
		formId: ""

    /**
     * hides all the messages and the progress bar
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */
		,successHandler: function(serviceResponse) {
			cursor_clear();			
			MessageHelper.hideAndClearMessage();
			//MessageHelper.displayStatusMessage(storeNLS['WISHLIST_EMAIL_SENT']);
			
			dojo.byId('SendWishListForm_Recipient_Email').value = '';
			dojo.byId('SendWishListForm_Sender_Name').value = '';
			dojo.byId('SendWishListForm_Sender_Email').value = '';
			dojo.byId('wishlist_message').value = '';
			
			dojo.byId("WC_WishListDisplay_div_5").style.display = 'none';
			dojo.byId("WishListEmailSucMsg_Div").style.display = "block";
			
			//limit the recipient number of characters in To: email address of email success message to 25 characters 
			dojo.byId("recipientEmail_wishListDisplay").innerHTML = serviceResponse.recipient[0].substring(0, 25);
		}
     /**
     * display an error message
     * @param (object) serviceResponse The service response object, which is the
     * JSON object returned by the service invocation
     */
		,failureHandler: function(serviceResponse) {

			if (serviceResponse.errorMessage) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
			} 
			else {
				 if (serviceResponse.errorMessageKey) {
					MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
				 }
			}
			cursor_clear();
		}

	})
