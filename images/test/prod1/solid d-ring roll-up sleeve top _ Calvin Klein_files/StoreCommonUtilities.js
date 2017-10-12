//-----------------------------------------------------------------
// Licensed Materials - Property of IBM
//
// WebSphere Commerce
//
// (C) Copyright IBM Corp. 2009, 2016 All Rights Reserved.
//
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with
// IBM Corp.
//-----------------------------------------------------------------


/** 
 * @fileOverview This file provides the common functions which are specific to the Madisons store.
 * This JavaScript file is used by StoreCommonUtilities.jspf.
 */

//Import the required Dojo libraries
dojo.registerModulePath("wc", "../wc");
	
dojo.require("wc.service.common");
dojo.require("dojo.io.iframe");
dojo.require("dojo.io.script");


//Reloads widgets when parts of the page has been re-loaded from server
dojo.require("dojo.parser");

//Category menu support
dojo.require("dijit.form.Button");
dojo.require("wc.widget.WCMenu");
dojo.require("wc.widget.WCDialog");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");	
dojo.require("dijit.Tooltip");
dojo.require("wc.widget.WCDropDownButton");
dojo.require("dijit.Dialog");
dojo.require("dojo.currency");
dojo.require("dijit.Tree");
dojo.require("dojo.back");
dojo.require("dijit.form.DateTextBox");
dojo.require("wc.widget.RefreshArea");
dojo.require("wc.render.RefreshController");
dojo.require("wc.render.Context");
dojo.require("dojo.cookie");
dojo.require("dojo.topic");
dojo.subscribe("ajaxRequestInitiated", "incrementNumAjaxRequest");
dojo.subscribe("ajaxRequestCompleted", "decrementNumAjaxRequest");
dojo.subscribe("ajaxRequestCompleted", "initializeInactivityWarning");

// Handle Order error.
dojo.subscribe("OrderError", "orderErrorHandler");


/** This variable indicates whether the dropdown is shown or not. */
var showDropdown = false;

/** This variable stores the current dropdown dialog element. */
var dropDownDlg = null;

/** This variable stores the current product added dropdown dialog element. */
var productAddedDropDownDlg = null;

/** This variable is used to store the width of the mini shopping cart on page load. It is used when shopper's browser is IE6. */
var originalMiniCartWidth = 0;

/** This variable indicates whether the browser used is Internet Explorer or not. */
var isIE = (document.all) ? true : false;

/** Initializes the variable to false. **/
	var correctBrowser = false;

/** 
 * This variable indicates whether a request has been submitted or not.
 * The value is initialized to true and resets to false on full page load.
 */
var requestSubmitted = true;

/** 
 * This variable stores the id of the element (ex: button/link) which the user clicked.
 * This id is set when the user clicks an element which triggers an Ajax request.
 */
var currentId = "";

/** 
 * This variable keeps track of the number of active ajax requests currently running on the page 
 * The value is initialized to 0.
 */
var numAjaxRequests = 0;

var widgetsList = [];

/**
 * Variable to save whether a tab or shift-tab was pressed
 */
var tabPressed = false;

/** This variable is used to keep track of the quick info/compare touch events */
var currentPopup = '';

/** This variable indicates whether Android is used or not */
var android = null;

/** This variable indicates whether iOS is used or not */
var ios = null;

/** 
 * This variable contains the cookie domain for current store cookies.
 * Modify the cookie domain once here and it will be applied everywhere else for the particular store.
 */
var cookieDomain = "";

/** Base Text Direction Preference */
var _BTD_PREFS = "WC_Base_Text_Direction";	

/**
 * Initialize the client side inactivity warning dialog, this function is called at every page load and at 
 * every the time when ajax request completed.  Be default, 30 seconds before the session timeout, a dialog
 * will popup and display a warning to let the user to extend the time.  The timing of when the dialog
 * will be displayed can be modified with "inactivityWarningDialogBuffer" variable in CommonJSToInclude.jspf
 */
function initializeInactivityWarning() {

	// only set timer if user is not guest, in a full-auth session, and is able to retrieve inactivityTimeout from server
	if (U.isRegisteredUser() && inactivityTimeout != 0 && document.cookie.indexOf("WC_USERACTIVITY_") > 0) {
		// Reset the inactivity timer dialog
		if (inactivityTimeoutTracker != null) {
			clearTimeout(inactivityTimeoutTracker);
		}
		
		// setup the inactivity timout tracker
		inactivityTimeoutTracker = setTimeout(showInactivityWarningDialog, inactivityTimeout - inactivityWarningDialogBuffer);
	}
}

function orderErrorHandler(errorObj){
	if(errorObj.errorCode == 'CMN4512I'){
		//CMN4512I is OrderLocked error. So refresh miniCart.
		setDeleteCartCookie();
		//Since cart cookie is deleted, we don't need to pass currency/lang. It will be fetched from server
		loadMiniCart(null,null); 
	}
}

/**
 * Show the inactivity warning dialog, the dialog will be closed in 20 seconds.  The timing of when the dialog
 * will be closed can be modified with "inactivityWarningDialogDisplayTimer" variable in CommonJSToInclude.jspf
 */
function showInactivityWarningDialog() {
	dijit.byId("inactivityWarningPopup").show();
	if (dialogTimeoutTracker != null) {
		clearTimeout(dialogTimeoutTracker);
	}
	dialogTimeoutTracker = setTimeout(hideInactivityWarningDialog, inactivityWarningDialogDisplayTimer);
}

/**
 * Hide the inactivity warning dialog
 */
function hideInactivityWarningDialog() {
	dijit.byId("inactivityWarningPopup").hide();
}

/**
 * Send a Ping request to server to reset the inactivity timer.  The client side timer to display the inactivity warning
 * dialog will also be reset.
 */
function resetServerInactivity() {
	dojo.xhrPost({
		url: getAbsoluteURL() + "Ping",				
		handleAs: "json-comment-filtered",
		content: null,
		service: this,
		load: function(serviceResponse, ioArgs) {
			if (serviceResponse.success) {
				initializeInactivityWarning();
			} else {
				console.error("Ping service failed");				
			}
		},
		error: function(errObj, ioArgs) {
			console.error("Ping service failed");
		}
	});
}

/**
 * DOM Shorthand
 */
function byId(r){
	return document.getElementById(r);
}

/** 
 * Sends back focus to the first focusable element on tabbing from the last focusable element.
 */
function focusSetter(){  
	if(dojo.byId("MiniCartFocusReceiver1"))
		dojo.byId("MiniCartFocusReceiver1").focus();
	else
		dojo.byId("MiniCartFocusReceiver2").focus();
}

/** 
 * Sends back focus to the last focusable element on reverse tabbing from the first focusable element.
 * 
 * @param {object} event The event triggered from user actions
 */
function determineFocus(event) {
		if(event.shiftKey && event.keyCode == dojo.keys.TAB)
		{
			if(event.srcElement)
			{
				if(event.srcElement.id=="MiniCartFocusReceiver1")
				{
					if(dojo.byId("WC_MiniShopCartDisplay_link_5"))
					{
						dojo.byId("WC_MiniShopCartDisplay_link_5").focus();
					}
					dojo.stopEvent(event);
				}
				else if(event.srcElement.id=="MiniCartFocusReceiver2")
				{
					dojo.byId("MiniCartFocusReceiver2").focus();
					dojo.stopEvent(event);
				}
			}
			else
			{
				if(event.target.id=="MiniCartFocusReceiver1")
				{
					if(dojo.byId("WC_MiniShopCartDisplay_link_5"))
					{
						dojo.byId("WC_MiniShopCartDisplay_link_5").focus();
					}
					dojo.stopEvent(event);
				}
				else if(event.target.id=="MiniCartFocusReceiver2")
				{
					dojo.byId("MiniCartFocusReceiver2").focus();
					dojo.stopEvent(event);
				}
			}
		}
}

/**
 * Destroys the existing dialogs with outdated data.
 * @param {string} contentId The identifier of the dialog to destroy. If undefined, the default is 'quick_cart_container'.
 */
function destroyDialog(contentId){
	if(contentId == undefined){
		contentId = 'quick_cart_container';
	} 
	//If data has changed, then we should destroy the quick_cart_container dialog and recreate it with latest data
	dojo.query('.dijitDialog', document).forEach(function(tag) {
		if (dijit.byNode(tag).id == contentId) 
			dijit.byNode(tag).destroyRecursive();// or dijit.getEnclosingWidget(tag).destroyRecursive();
	 });
	 
	if(contentId != undefined && contentId == 'quick_cart_container'){
	 	 dropDownDlg = null;
	} else {
		productAddedDropDownDlg = null;
	}
}

/**
 * Hides the DialogUnderlayWrapper component, the component that grays out the screen behind,
 * as we do not want the background to be greyed out.
 */
function hideUnderlayWrapper(){
	dojo.query('.dijitDialogUnderlayWrapper', document).forEach(function(tag) {		
		tag.style.display='none';
	});	
}

/**
 * Loads the specified URL.
 *
 * @param {string} url The URL of the page to be loaded.
 */
function loadLink(url){
	document.location.href=url;
}

/**
 * Clears the Search term string displayed in Simple Search field.
 */
function clearSearchField() {
	searchText = document.getElementById("SimpleSearchForm_SearchTerm").value;
	if(searchText == document.getElementById("searchTextHolder").innerHTML){
		document.getElementById("SimpleSearchForm_SearchTerm").value = "";
	}
	else{
		document.getElementById("SimpleSearchForm_SearchTerm").select();
		showAutoSuggestIfResults();
		autoSuggestHover = false;
	}
}

/**
 * Displays the Search term string in Simple Search field.
 */
function fillSearchField() {
	if (document.getElementById("SimpleSearchForm_SearchTerm").value == "") {
		document.getElementById("SimpleSearchForm_SearchTerm").className = "search_input gray_color";
		document.getElementById("SimpleSearchForm_SearchTerm").value = document.getElementById("searchTextHolder").innerHTML;
	}
	// hide the search box results
	if(!autoSuggestHover) {
		showAutoSuggest(false);
	}
}

/**
 * Displays the top dropdown menu, including the category dropdowns and the mini shopping cart.
 */
function showDropDownMenu(){
	var showMenu = document.getElementById("header_menu_dropdown");
	if(document.getElementById("header_menu_dropdown")!=null && document.getElementById("header_menu_dropdown")!='undefined'){
		showMenu.style.display = "block";
	}
	if(document.getElementById("outerCartContainer")!=null && document.getElementById("outerCartContainer")!='undefined'){
		var outershopcart = document.getElementById("outerCartContainer");
		outershopcart.style.display = "block";
	}
}

/**
 * Initializes the mini shopping cart object and subscribes dojo actions on this object.
 */
function initShopcartTarget(){
			
	dojo.subscribe("/dnd/drop", function(source, nodes, copy, target){
		if (source != target) {
			target.deleteSelectedNodes();
		}
		var actionListScroll = new popupActionProperties(); 
		actionListScroll.showProductCompare = showProductCompare;

		if(target.parent.id=='miniShopCart_dndTarget'){
			var indexOfIdentifier = source.parent.id.indexOf("_",0);
			if ( indexOfIdentifier >= 0) {
				//remove the prefix including the "underscore"
				source.parent.id = source.parent.id.substring(indexOfIdentifier+1);					
			}
			if(source.node.getAttribute('dndType')=='item' || source.node.getAttribute('dndType')=='package') {
				categoryDisplayJS.AddItem2ShopCartAjax(source.parent.id ,1);
			} else if(source.node.getAttribute('dndType')=='product' || source.node.getAttribute('dndType')=='bundle') {
				showPopup(source.parent.id,function(e){return e;},'miniShopCart_dndTarget',null,actionListScroll);
			}
		}
	});
}

/**
 * Displays the progress bar dialog to indicate a request is currently running.
 * There are certain cases where displaying the progress bar causes problems in Opera,
 * the optional parameter "checkForOpera" is passed to specifically check if the browser used is Opera,
 * if so, do not display the progress bar in these cases.
 *
 * @param {boolean} checkForOpera Indicates whether to check if the browser is Opera or not.
 */

var _cursorTimeoutId;

function cursor_wait()
{
	_showPopupTimeoutId=setTimeout('showProgressBar()',500);
}

/**
 * Helper method for cursor_wait() to display the progress bar pop-up.
 * Displays progress bar, next to the element if the element id was specified in currentId,
 * or defaults to the center of the page if currentId is empty.
 * Progress bar will only be displayed if the submitted request has not been completed.
 * This method is only called implicitly by the cursor_wait() method, which is triggered before a request is submitted.
 */
function showProgressBar(){
	//After the delay, if the request is still not finished
	//Then continue and show the progress bar
	//Otherwise, do not execute the following code
	if(!requestSubmitted){
		return;
	}
	
	displayProgressBar();
	
}


/**
 * Helper method for showProgressBar() to display the progress bar pop-up.
 * It can also be forced to show the progress bar directly in special cases.
 * The function also displays the progress bar next to the element if the element id was specified in currentId,
 * or defaults to the center of the page if currentId is empty.
 * This method can be called implicitly by the cursor_wait() method or explicitly by itself.
 */

function displayProgressBar()
{
	clearTimeout(_showPopupTimeoutId);
	
	U.fadeIn(U.$progressBar,{show:true});
	
	//Make sure the progress bar dialog goes away after 30 minutes
	//and does not hang if server calls does not return
	//Assuming the longest server calls return before 30 minutes
	_cursorTimeoutId=setTimeout("cursor_clear()",1800000);
}

/**
 * Stores the id of the element (ex: button/link) that triggered the current submitted request.
 * Store the new element id only when no request is currently running.
 *
 * @param {string} id The id of element triggering the submitted request.
 */
function setCurrentId(id){
	//If there is no request already submitted, update the id
	if(!requestSubmitted && this.currentId == ""){
		this.currentId = id;
	}
}

/**
 * This function trims the spaces from the pased in word.
 * Delete all pre and trailing spaces around the word.
 * 
 * @param {string} inword The word to trim.
 */
function trim(inword)
{
	word = inword.toString();
	var i=0;
	var j=word.length-1;
	while(word.charAt(i) == " ") i++;
	while(word.charAt(j) == " ") j=j-1;
	if (i > j) {
		return word.substring(i,i);
	} else {
		return word.substring(i,j+1);
	}
}

/**
 * Hides the progress bar dialog when the submitted request has completed.
 * Set the visibility of the progress bar dialog to hide from the page.
 */
function cursor_clear()
{
	resetRequest();
	this.currentId=U.EMPTY;
	
	U.fadeOut(U.$progressBar,{hide:true});
	clearTimeout(_cursorTimeoutId);
}	

function escapeXml (str, fullConversion){
	if(fullConversion){
		str = str.replace(/&(?!(quot;|#34;|#034;|#x27;|#39;|#039;))/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;");
	}
	str = str.replace(/"/gm, "&#034;").replace(/'/gm, "&#039;");
	return str;
}
/**
 * Checks whether a request can be submitted or not.
 * A new request may only be submitted when no request is currently running.
 * If a request is already running, then the new request will be rejected.
 *
 * @return {boolean} Indicates whether the new request was submitted (true) or rejected (false).
 */
function submitRequest() {
	if(!requestSubmitted) {
		requestSubmitted  = true;
		dojo.topic.publish("requestSubmittedChanged", requestSubmitted);
		return true;
	}
	return false;
}

function resetRequest() {
	requestSubmitted = false;
	dojo.topic.publish("requestSubmittedChanged", requestSubmitted);
}
 
/**
 * Set the current page to a new URL.
 * Takes a new URL as input and set the current page to it, executing the command in the URL.
 * Used for Non-ajax calls that requires multiple clicks handling.
 * 
 * @param {string} newPageLink The URL of the new page to redirect to.
 */
function setPageLocation(newPageLink) {
	//For Handling multiple clicks
	if(!submitRequest()){
		return;
	}
			
	document.location.href = newPageLink;
}

/**
 * Submits the form parameter.
 * Requires a form element to be passed in and submits form with its inputs.
 * Used for Non-ajax calls that requires multiple clicks handling.
 *
 * @param {element} form The form to be submitted.
 */
function submitSpecifiedForm(form) {
	if(!submitRequest()){
		return;
	}
	console.debug("form.action == "+form.action);
	processAndSubmitForm(form);
}


/**
 * Parses a Dojo widget.
 * Pass in the id of a dojo widget or a HTML container element containing a dojo widget, such as a div,
 * and this method will parse that widget, or all the widgets within that HTML container element.
 * 
 * @param {string} id The id of a dojo widget or a HTML container of a dojo widget to be parsed.
 */
function parseWidget(id)
{
	/*
	var node;
	var widget = dijit.byId(id);
	
	if (widget == null || widget == undefined)
	{
		if (id == null || id == undefined)
		{	
			node = dojo.body();
		}
		else
		{
			node = dojo.byId(id);
		}
		
		if (node != null && node != undefined)
		{
			if (node.getAttribute("dojoType") != null && node.getAttribute("dojoType") != undefined)
			{
				dojo.parser.instantiate([node]);
			}
			else
			{
				dojo.parser.parse(node);
			}
		}
	}
	*/
}

function parseAllWidgets(){
	for(var i = 0; i < widgetsList.length; i++){
		parseWidget(widgetsList[i]);
	}
}

function addToWidgetsList(widgetId){
	widgetsList.push(widgetId);
}


/**
 * Parses the co-shopping Dojo widget.
 * @param {string} id The id of a coshopping dojo widget or a HTML container of a dojo widget to be parsed.
 */
function parseWCCEAWidget(id)
{
	var node;
	var widget = ceadijit.byId(id);
	
	if (widget == null || widget == undefined)
	{
		if (id == null || id == undefined)
		{	
			node = ceadojo.body();
		}
		else
		{
			node = ceadojo.byId(id);
		}
		
		if (node != null && node != undefined)
		{
			if (node.getAttribute("ceadojoType") != null && node.getAttribute("ceadojoType") != undefined)
			{
				ceadojo.parser.instantiate([node]);
			}
			else
			{
				ceadojo.parser.parse(node);
			}
		}
	}
}

/**
 * Parses the header menu.
 * The header menu is only parsed when the user hovers over it to improve the performance of the store loading.
 *
 * @param {string} id The id of the menu item which the user hovers over to initialize the progress bar next to that item.
 */
function parseHeader(id)
{
	var showMenu = document.getElementById("header_menu_loaded");
	var hideMenu = document.getElementById("header_menu_overlay");
	
	if(currentId.length == 0 && document.getElementById("header_menu_loaded")!=null && document.getElementById("header_menu_loaded")!='undefined' && document.getElementById("header_menu_overlay")!=null && document.getElementById("header_menu_overlay")!='undefined' && document.getElementById("header_menu_loaded").style.display == 'none')
	{
		setCurrentId((id != null && id != undefined)?id:hideMenu.id);
		submitRequest();
		cursor_wait();
		hideMenu.style.display = "none";
		parseWidget("header_menu_loaded");
		showMenu.style.display = "block";
		cursor_clear();
		
		//the headers are parsed now. Connect _onDropDownClick to Coshopping's topCategoryClicked
		try {
			if (window.top._ceaCollabDialog!=undefined || window.top._ceaCollabDialog!=null) {
				dijit.registry.byClass("wc.widget.WCDropDownButton").forEach(function(w){
					dojo.connect(w, '_onDropDownClick', dojo.hitch(window.top._ceaCollabDialog, "topCategoryClicked", w.getURL()));
					dojo.connect(w, 'onKeyPress', window.top._ceaCollabDialog, function(e) {
						if (e.keyCode == dojo.keys.ENTER) {
							window.top._ceaCollabDialog.topCategoryClicked(w.getURL());
						}
					}); 
				});			
			}
		}catch(err) {
			console.log(err);
		}
	}
}

/**
 * get location information of a given url
 * @param href
 * @returns url
 */
function getLocation(href) {
	var urlHref = href;
	if (!urlHref.match(/^[a-zA-Z]+:\/\//))
	{
		urlHref = 'http://' + urlHref;
	}
	 var urlLocation = document.createElement("a");
	 urlLocation.href = urlHref;
	 
	 return urlLocation;
}

/**
 * If the return URL belongs to a different domain from the current host,
 * return a blank page while go back button is clicked
 * @param url
 * @returns {String}
 */
function getReturnUrl(url) {
	var returnUrl;
	var urlLocation = this.getLocation(decodeURIComponent(url));
	if (urlLocation.hostname === location.hostname)
		 returnUrl = url;
	else returnUrl = 'about:blank';
	location.href = returnUrl;
}

/**
 * solve issues in case cache is turned on, sometimes url is cached with 
 * http or https portocol while accessed from an https or http protocol later on.
 * In this case we will match the protocol for ajax calls consistent with document.location.href 
 * protocol
 * @param url
 * @returns {URL}
 */
function matchUrlProtocol(url){
	var href = document.location.href;
	var index = href.lastIndexOf("s", 4);
	var newUrl = url;
	var urlIndex = newUrl.lastIndexOf("s", 4);
	if (index != -1 && urlIndex == -1){
		 newUrl=newUrl.substring(0,4) + "s" + (newUrl.substring(4));	
	}
	else if(index == -1 && urlIndex != -1)
	{
		newUrl = newUrl.substring(0,4) + (newUrl.substring(5));
	}
	return newUrl;
}

 /**
  * This function is used to hide an element with the specified id.
  * @param {string} elementId The id of the element to be hidden.
  */

  function hideElementById(elementId){
		var div = dojo.byId(elementId);
		div.style.display = "none";
 }

/**
  * This function is used to display an element with the specified id.
  * @param {string} elementId The id of the element to be displayed.
  */

   function showElementById(elementId){
		var div = dojo.byId(elementId);
		div.style.display = "block";
}

/**
  * This function is used to hide the background image of an element.
  * @param {DomNode} element The node whose background image is to be hidden.
  */
    function hideBackgroundImage(element){
		element.style.backgroundImage='none';
}

/**
  * This function is used to display the background image of a product onhover.
  * @param {DomNode} element The node for which the product hover background image is to be displayed.
  */

	 function showBackgroundImage(element){
		element.style.backgroundImage='url('+getImageDirectoryPath()+getStyleDirectoryPath()+'product_hover_background.png)';
}
	/**
	* checkIE8Browser checks to see if the browser is IE 8 or less. It then sets correctBrowser to true if it is.
	*
	**/
	
	function checkIE8Browser() { 
       if( dojo.isIE && dojo.isIE <= 8 ){
    	    correctBrowser = true
       }
   } 
 
	/**
	* ApprovalToolLink provides the appropriate URL if the browser is correct, otherwise displays a message.
	*
	* @param {String} idTag Used to identify the id tag in the jsp that is calling it.
	* @param {String} approvalToolLinkURL This is a URL which is passed from the calling jsp.
	*
	**/
   
	function ApprovalToolLink(idTag, approvalToolLinkURL) { 
		
		//checks if the browser is IE 8 or less.
		checkIE8Browser();
		
		if (correctBrowser) {
    	  RFQwindow=window.open(approvalToolLinkURL);
		}
		else {      
    	  MessageHelper.formErrorHandleClient(idTag,MessageHelper.messages["ERROR_INCORRECT_BROWSER"]); return;
    	}
	}  


/**
 * Updates view (image/detailed) and starting index of pagination of product display in SetCurrencyPreferenceForm when currency is changed from the drop-down menu. 
 * These are later passed as url parameters.
 */

function updateViewAndBeginIndexForCurrencyChange(){
	if(document.getElementById('fastFinderResultControls')!=null && document.getElementById('fastFinderResultControls')!='')
	{	
		if(document.SetCurrencyPreferenceForm.pageView!=null){
			document.SetCurrencyPreferenceForm.pageView.value = document.FastFinderForm.pageView.value;
		}
		if(document.SetCurrencyPreferenceForm.beginIndex!=null){
			document.SetCurrencyPreferenceForm.beginIndex.value = document.FastFinderForm.beginIndex.value;
		}
	}
	else if(document.getElementById('CategoryDisplay_Widget')!=null && document.getElementById('CategoryDisplay_Widget')!='')
	{
		if(wc.render.getContextById('CategoryDisplay_Context').properties['pageView']!='' && document.SetCurrencyPreferenceForm.pageView!=null){
			document.SetCurrencyPreferenceForm.pageView.value = wc.render.getContextById('CategoryDisplay_Context').properties['pageView'];
		}
		if(wc.render.getContextById('CategoryDisplay_Context').properties['beginIndex']!='' && document.SetCurrencyPreferenceForm.beginIndex!=null){
			document.SetCurrencyPreferenceForm.beginIndex.value = wc.render.getContextById('CategoryDisplay_Context').properties['beginIndex'];
		}
	}
	else if(document.getElementById('Search_Result_Summary')!=null && document.getElementById('Search_Result_Summary')!='')
	{
		if(wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsView']!='' && document.SetCurrencyPreferenceForm.pageView!=null){
			document.SetCurrencyPreferenceForm.pageView.value = wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsView'];
		}
		if(wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsPageNum']!='' && document.SetCurrencyPreferenceForm.beginIndex!=null){
			document.SetCurrencyPreferenceForm.beginIndex.value=wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsPageNum']
		}
	}
	else if(document.getElementById('Search_Result_Summary2')!=null && document.getElementById('Search_Result_Summary2')!='')
	{
		if(wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsView']!='' && document.SetCurrencyPreferenceForm.pageView!=null){
			document.SetCurrencyPreferenceForm.pageView.value = wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsView'];
		}
		if(wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsPageNum']!='' && document.SetCurrencyPreferenceForm.beginIndex!=null){
			document.SetCurrencyPreferenceForm.beginIndex.value=wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsPageNum']
		}
	}
	
	//allow coshopper to change currency. Only used for coshopping
	try {
		if (window.top._ceaCollabDialog!=undefined || window.top._ceaCollabDialog!=null) {	
			dojo.byId('SetCurrencyPreferenceForm').URL.value= 
					dojo.byId('SetCurrencyPreferenceForm').URL.value + "&coshopChangeCurrency=" +
					dojo.byId('currencySelection').options[dojo.byId('currencySelection').selectedIndex].value;
		}
	}catch(err) {
		console.log(err);
	}
}


/**
 * Updates view (image/detailed) and starting index of pagination of product display in LanguageSelectionForm when language is changed from the drop-down menu.
 * These are later passed as url parameters.
 */

function updateViewAndBeginIndexForLanguageChange(){
	if(document.getElementById('fastFinderResultControls')!=null && document.getElementById('fastFinderResultControls')!='')
	{
		if(document.LanguageSelectionForm.pageView!= null){
			document.LanguageSelectionForm.pageView.value = document.FastFinderForm.pageView.value;
		}
		if(document.LanguageSelectionForm.beginIndex!= null){
			document.LanguageSelectionForm.beginIndex.value = document.FastFinderForm.beginIndex.value;
		}
	}
	else if(document.getElementById('CategoryDisplay_Widget')!=null && document.getElementById('CategoryDisplay_Widget')!='')
	{
		if(wc.render.getContextById('CategoryDisplay_Context').properties['pageView']!='' && document.LanguageSelectionForm.pageView!= null){
			document.LanguageSelectionForm.pageView.value = wc.render.getContextById('CategoryDisplay_Context').properties['pageView'];
		} 
		if(wc.render.getContextById('CategoryDisplay_Context').properties['beginIndex']!='' && document.LanguageSelectionForm.beginIndex!= null){
			document.LanguageSelectionForm.beginIndex.value = wc.render.getContextById('CategoryDisplay_Context').properties['beginIndex'];
		} 
	}
	else if(document.getElementById('Search_Result_Summary')!=null && document.getElementById('Search_Result_Summary')!='')
	{
		if(wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsView']!='' && document.LanguageSelectionForm.pageView!= null){
			document.LanguageSelectionForm.pageView.value = wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsView'];
		}
		if(wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsPageNum']!='' && document.LanguageSelectionForm.beginIndex!= null){
			document.LanguageSelectionForm.beginIndex.value = wc.render.getContextById('catalogSearchResultDisplay_Context').properties['searchResultsPageNum'];
		}
	}
	else if(document.getElementById('Search_Result_Summary2')!=null && document.getElementById('Search_Result_Summary2')!='')
	{
		if(wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsView']!='' && document.LanguageSelectionForm.pageView!= null){
			document.LanguageSelectionForm.pageView.value = wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsView'];
		}
		if(wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsPageNum']!='' && document.LanguageSelectionForm.beginIndex!= null){
			document.LanguageSelectionForm.beginIndex.value = wc.render.getContextById('contentSearchResultDisplay_Context').properties['searchResultsPageNum'];
		}
	}
	
	//appending landId to the URL. Only used for coshopping
	try {
		if (window.top._ceaCollabDialog!=undefined || window.top._ceaCollabDialog!=null) {	
			dojo.byId('LanguageSelectionForm').action= 
				dojo.byId('LanguageSelectionForm').action + "&langId=" +
				dojo.byId('languageSelection').options[dojo.byId('languageSelection').selectedIndex].value;
		}
	}catch(err) {
		console.log(err);
	}
}

/**
 * Displays the header links in two lines.
 */
function showHeaderLinksInTwoLines(){
	if(document.getElementById("header_links")!=null && document.getElementById("header_links")!='undefined'){
		if(dojo.contentBox(document.getElementById("header_links")).w > 750){
			if(document.getElementById("header_links1")!=null && document.getElementById("header_links1")!='undefined'){
				document.getElementById("header_links1").style.display = "block";
			}
			if(document.getElementById("headerHomeLink")!=null && document.getElementById("headerHomeLink")!='undefined'){
				document.getElementById("headerHomeLink").style.display = "none";
			}
			if(document.getElementById("headerShopCartLink")!=null && document.getElementById("headerShopCartLink")!='undefined'){
				document.getElementById("headerShopCartLink").style.display = "none";
			}
		}
		document.getElementById("header_links").style.visibility="visible";
	}
}

/**
  * Displays the header links in one line.
  */
 function showLinksInOneLine(){
 	if(document.getElementById("header_links")!=null && document.getElementById("header_links")!='undefined'){
 		document.getElementById("header_links").style.visibility="visible";
 	}
 }

/**
 * Validates if the input value is a non-negative integer using regular expression.
 *
 * @param {String} value The value to validate.
 * 
 * @return {Boolean} Indicates if the given value is a non-negative integer. 
 */
function isNonNegativeInteger(value){
	var regExpTester = new RegExp(/^\d*$/);
	return (value != null && value != "" && regExpTester.test(value));
}

/**
* Validates if the input value is a positive integer.
*
* @param {String} value The value to validate.
* 
* @return {Boolean} Indicates if the given value is a positive integer. 
*/
function isPositiveInteger(value){
	return (isNonNegativeInteger(value) && value != 0);
}

/**
 * This function closes all dijit.dialogs on the page. 
 */
function closeAllDialogs(){
	dijit.registry.byClass("dijit.Dialog").forEach(function(w){w.hide()});
}
 
/**
 * This function store a error key in the cookie. The error key will be used to retrieve error messages. 
 * @param {String} errorKey  The key used to retrieve error/warning messages. 
 */
function setWarningMessageCookie(errorKey) {
	setCookie("signon_warning_cookie",errorKey, {path: "/", domain: cookieDomain});
}
/**
* This function removes a cookie
* @param {String} name the name of the cookie to be removed. 
*/
function removeCookie(name) {
	setCookie(name, null, {expires: -1});
}
/**
* This function gets a cookie
* @param {String} c the name of the cookie to be get.
*/
function getCookie(c) {
	var cookies = document.cookie.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var index = cookies[i].indexOf("=");
		var name = cookies[i].substr(0,index);
		name = name.replace(/^\s+|\s+$/g,"");
		if (name == c) {
			return decodeURIComponent(cookies[i].substr(index + 1));
		}
	}
}

function deleteOnBehalfRoleCookie(){
	var deleteOnBhealfRoleCookieVal = getCookie("WC_OnBehalf_Role_"+WCParamJS.storeId);

	if(deleteOnBhealfRoleCookieVal != null){
		setCookie("WC_OnBehalf_Role_"+WCParamJS.storeId, null, {expires:-1,path:'/', domain:cookieDomain});
	}
}

/**
* This function gets a cookie by name which starts with the provided string
* @param {String} c the partial name (starts with) of the cookie to be get.
*/
function getCookieName_BeginningWith(c) {
	var cookies = document.cookie.split(";");
	for (var i = 0; i < cookies.length; i++) {
		var index = cookies[i].indexOf("=");
		var name = cookies[i].substr(0,index);
		name = name.replace(/^\s+|\s+$/g,"");
		if (stringStartsWith(name,c)) {
			return name;
		}
	}
}

/**
* This function checks to see if the string start with the specified set of characters
* @param {String} basestr the string
* @param {String} c the substring to check for
*/
function stringStartsWith(basestr, str) {
	return str.length > 0 && basestr.substring( 0, str.length ) === str
}

/**
 * checks if the store is in preview mode
 * @param {String} contextPathUsed The context path being used by the Store. 
 * @param {String} criteria criteria used to check if contextPathUsed is the preview context. 
 */
function isStorePreview(contextPathUsed,criteria) {
	if(contextPathUsed.indexOf(criteria)>-1) {
		return true;
	}
	return false;
}

/**
 * checks hides the ESpot info popup window
 * @param {String} The id of the popup dialog
 * @param {String} The browser event
 */
function hideESpotInfoPopup(id,event) { 
	if(event!=null && event.type=="keypress" && event.keyCode!="27") {
		return;
	}
	else {
		var quickInfo = dijit.byId(id);
		if(quickInfo != null) {
			quickInfo.hide();
		}
	}
}

/**
 * checks shows the ESpot info popup window
 * @param {String} The id of the popup dialog
 * @param {String} The browser event
 */
function showESpotInfoPopup(id,event) { 
	if(event!=null && event.type=="keypress" && event.keyCode!="13") {
		return;
	}
	else {
		if(!parent.checkPopupAllowed()){
			return;
		}
		var quickInfo = dijit.byId(id);
		if(quickInfo != null) {
			quickInfo.show();
		}
	}
}  
/**
* This function increments the numAjaxRequests counter by 1. 
*/
function incrementNumAjaxRequest(){
	if(numAjaxRequests != 'undefined'){
		numAjaxRequests++;
	}
}

/**
* This function decrements the numAjaxRequests counter by 1. 
*/
function decrementNumAjaxRequest(){
	if(numAjaxRequests != 'undefined'){
		if(numAjaxRequests != 0){
			numAjaxRequests--;
		}
	}
}

/**
* updateParamObject This function updates the given params object with a key to value pair mapping.
*				    If the toArray value is true, It creates an Array for duplicate entries otherwise it overwrites the old value.
*			        This is useful while making a service call which accepts a few parameters of type array.
*					This function is used to prepare a a map of parameters which can be passed to XMLHttpRequests. 
* 					The keys in this parameter map will be the name of the parameter to send and the value is the corresponding value for each parameter key.
* @param {Object} params The parameters object to add name value pairs to.
* @param {String} key The new key to add.
* @param {String} value The new value to add to the specified key.
* @param {Boolean} toArray Set to true to turn duplicate keys into an array, or false to override previous values for a specified key.
* @param {int} index The index in an array of values for a specified key in which to place a new value.
*
* @return {Object} params A parameters object holding name value pairs.
*
**/
function updateParamObject(params, key, value, toArray, index){
	
	if(params == null) {
		params = [];
	}
	if(params[key] != null && toArray) {
		if(dojo.lang.isArrayLike(params[key])) {
			//3rd time onwards
			if(index != null && index != "") {
				//overwrite the old value at specified index
				params[key][index] = value;
			} else {
				params[key].push(value);
			}
		} else {
			//2nd time
			var tmpValue = params[key];
			params[key] = [];
			params[key].push(tmpValue);
			params[key].push(value);
		}
   } else {
	   //1st time
	   if(index != null && index != "" && index != -1) {
		   //overwrite the old value at specified index
		   params[key+"_"+index] = value;
	   } else if(index == -1) {
		   var i = 1;
		   while(params[key + "_" + i] != null) {
			   i++;
		   }
		   params[key + "_" + i] = value;
	   } else {
		   params[key] = value;
	   }
   }
   return params;
 }

/** 
 * Show the html element
 * 
 * @param {string} id The id of the section to show.
 */
function showSection (id){
	var section = dojo.byId(id);
	if(section!=null && section!='undefined'){
		section.style.visibility="visible";
	}
}

/** 
 * Hides the html element.
 * 
 * @param {string} id The id of the section to hide. 
 */	
function hideSection (id){
	var section = dojo.byId(id);
	if(section!=null && section!='undefined'){
		section.style.visibility="";
	}
}
 
/** 
 * hides the section if the user clicks shift+tab.
 * 
 * @param {string} id The id of the div area to hide. 
 * @param {event} event The keystroke event entered by the user. 
 */	
function shiftTabHideSection (id, event){
	if (event.shiftKey && (event.keyCode == dojo.keys.TAB)){
		hideSection(id);
	} 
}

/** 
 * hides the section if the user clicks tab.
 * 
 * @param {string} id The id of the div area to hide. 
 * @param {event} event The keystroke event entered by the user. 
 */	
function tabHideSection (id, event, nextId){
	if (!event.shiftKey && (event.keyCode == dojo.keys.TAB)){
		if(null != nextId){
			dojo.byId(nextId).focus();
		}
		hideSection(id);
		dojo.stopEvent(event);
	} 
}

/**
 * Saves whether the shift and tab keys were pressed or not.  Ignores tab.
 * @param {event} event The event that happened by pressing a key
 */
function saveShiftTabPress(event) {
	if (event.shiftKey == true && event.keyCode == 9) {
		tabPressed = true;
	}
}

/**
 * Saves whether the tab key was pressed or not.  Ignores SHIFT-tab.
 * @param {event} event The event that happened by pressing a key
 */
function saveTabPress(event) {
	if (event.shiftKey == false && event.keyCode == 9) {
		tabPressed = true;
	}
}
/**
 * Sets the focus to the given form element if a tab or shift-tab was pressed.  Workaround to tabbing from a country dropdown
 * to a dynamic state element that becomes a dropdown when it was a textbox and vice versa.  Defect was Firefox specific. 
 * @param {String} formElementId The form element id to set the focus to
 */
function setFocus(formElementId) {
	if (tabPressed) {
		tabPressed = false;
		document.getElementById(formElementId).focus();
	}
}

/**
 * Increase the height of a container due to the addition of a message
 * @param ${String} The id of the container whose height will be increased
 * @param ${Integer} Number of pixels to increase height by
 */
function increaseHeight(containerId, increase) {
	var temp = document.getElementById(containerId).offsetHeight;
	document.getElementById(containerId).style.height = (temp + increase) + 'px';
}

/**
 * Reload the current page.
 * @param ${forcedUrl} The url which sends user to the expected page.
 */
function redirectToSignOn(forcedUrl) {
	var href = document.location.href;
	var index = href.lastIndexOf("s", 4);	
	if (index != -1){
		var newHref = href;
	}else{
		// Loaded with HTTP			
		var newHref = href.substring(0,4) + "s" + (href.substring(4));				
	} 
	
	setCookie("WC_RedirectToPage_"+WCParamJS.storeId, forcedUrl , {path:'/', domain:cookieDomain});	
	setCookie("WC_DisplaySignInPanel_"+WCParamJS.storeId, "true" , {path:'/', domain:cookieDomain});	
	
	document.location.href = newHref;
}

/**
 * Keeps track of the current quick info/compare touch event in tablets
 * @param ${String} link The link of the product detail page
 * @param ${String} newPopup The id of the new product quick info/compare touched
 */
function handlePopup(link,newPopup) {
	if (currentPopup == newPopup){
		document.location.href = link;
	} else {
		currentPopup = newPopup;
	}
}

/**
 * Check to see if the device in use is running the android OS
 * @return {boolean} Indicates whether the device is running android
 */
function isAndroid() {
	if(android == null){
		if(navigator != null){
			if(navigator.userAgent != null){
				var ua = navigator.userAgent.toLowerCase();
				android = ua.indexOf("android") > -1; 
			}
		}
	}
	return android;
}

/**
 * Check to see if the device in use is running iOS
 * @return {boolean} Indicates whether the device is running iOS
 */
function isIOS() {
	if(ios == null){
		if(navigator != null){
			if(navigator.userAgent != null){
				var ua = navigator.userAgent.toLowerCase();
				ios = (ua.indexOf("ipad") > -1) || (ua.indexOf("iphone") > -1) || (ua.indexOf("ipod") > -1); 
			}
		}
	}
	return ios;
}


/**
* This function highlight all marketing spots and catalog objects in preview mode, overwriting the implementation in site level (StorePreviewerHeader.jsp)
*/
function outlineSpots(){
	dojo.addClass(document.body,'editMode');
	dojo.query('.carousel > .content').style({zIndex:'auto'});
	dojo.query(".ESpotInfo").style({ display:"block" });
	dojo.query(".searchScore").style({ display:"block" });
	dojo.query(".editManagedContent").style({ display:"block" });
	var all = dojo.query(".genericESpot,.product,.searchResultSpot,.productDetail,.categorySpot");
	for (var i = 0; i < all.length; i++) {
		var currEl = all[i];
		if(dojo.hasClass(currEl,"emptyESpot")){
			var elementWidth = dojo.query('.ESpotInfo',currEl)[0].offsetWidth+4;
			var elementHeight = dojo.query('.ESpotInfo',currEl)[0].offsetHeight+4;
			dojo.attr(currEl,'_width',dojo.style(currEl,'width'));
			dojo.attr(currEl,'_height',dojo.style(currEl,'height'));
			dojo.style(currEl,{'width':+elementWidth+'px','height':elementHeight+'px'});
			
		}
	 	if(dojo.query(".borderCaption",currEl).length==0){
	 		dojo.place("<div class='borderCaption'></div>",currEl,'first');
	 	}else{
	 		dojo.query(".borderCaption",currEl).style({'display':'block'});
	 	}
		if(currEl.addEventListener){
			currEl.addEventListener('mouseover',function(evt){
				if(!window.parent.frames[0].isSpotsShown()){return;}
				dojo.query(".caption").style({ display:"none" });
				dojo.style(dojo.query(".caption",this)[0],{ display:"block" });
				evt.stopPropagation();
			},false);
			currEl.addEventListener('mouseout',function(evt){
				if(!window.parent.frames[0].isSpotsShown()){return;}
				dojo.query(".caption",this).style({ display:"none" });
				evt.stopPropagation();
			},false);
		}else if(currEl.attachEvent){
			currEl.onmouseover=(
				(function(currEl){
					return (function(){
						if(!window.parent.frames[0].isSpotsShown()){return;}
						dojo.query(".caption").style({ display:"none" });
						dojo.style(dojo.query(".caption",currEl)[0],{ display:"block" });
						window.event.cancelBubble = true;
					});
				})(currEl)
			);
			currEl.onmouseleave=(
				(function(currEl){
					return (function(){
						if(!window.parent.frames[0].isSpotsShown()){return;}
						dojo.query(".caption",currEl).style({ display:"none" });
						window.event.cancelBubble = true;
						
					});
				})(currEl)
			);
		}
	}
}

/**
* This function un-highlight all marketing spots and catalog objects in preview mode, overwriting the implementation in site level (StorePreviewerHeader.jsp)
*/
function hideSpots(){
	dojo.removeClass(document.body,'editMode');
	dojo.query('.carousel > .content').style({zIndex:''});
	dojo.query(".ESpotInfo").style({ display:"none" });
	dojo.query(".caption").style({ display:"none" });
	dojo.query(".searchScore").style({ display:"none" });
	dojo.query(".editManagedContent").style({ display:"none" });
	dojo.query(".borderCaption").style({ display:"none" });
	dojo.query(".emptyESpot").forEach(function(e){
		dojo.style(e,{'width':dojo.attr(e,'_width')+'px'});
		dojo.style(e,{'height':dojo.attr(e,'_height')+'px'});
		});
	
}

/**
* This function resets the mini cart cookie values, then continues to log off the shopper.
*/
function logout(url){
	setDeleteCartCookie();
	document.location.href = url;
}

/**
 * This function submits the Language and Currency selection form.
 * @param formName The name of the Language and Currency selection form.
 */
function switchLanguageCurrency(formName) {
	//to get the browser current url
	var browserURL = document.location.href;
	var currentLangSEO = '/'+document.getElementById('currentLanguageSEO').value+'/';
	
	// get rid of anything after pound sign(#) in the URL if it is a SearchDisplay request.
	// search processes the query parameters and cannot handle a redirect URL with pound sign(#)
	if ((browserURL.indexOf('SearchDisplay') != -1 || browserURL.indexOf('CategoryDisplay') != -1) && browserURL.indexOf('#') != -1) {
		var poundTokens = browserURL.split('#');
		browserURL = poundTokens[0];
	}
	
	//set the form URL to the updated URL with the new language keyword
	//for example: replace /en/ with the new keyword
	var modifiedFormURL = browserURL;
	if (browserURL.indexOf(currentLangSEO) != -1) {
		if (document.getElementById('langSEO'+document.getElementById('languageSelection').options[document.getElementById('languageSelection').selectedIndex].value)) {
			var newLangSEO = '/'+document.getElementById('langSEO'+document.getElementById('languageSelection').options[document.getElementById('languageSelection').selectedIndex].value).value+'/';
			modifiedFormURL = browserURL.replace(currentLangSEO,newLangSEO);
		}
	}
	//replace langId with the newly selected langId
	if (modifiedFormURL.indexOf('&') != -1) {
		var tokens = modifiedFormURL.split('&');
		modifiedFormURL = "";
		for (var i=0; i<tokens.length; i++) {
			if (tokens[i].indexOf('langId=') == -1) {
				if (modifiedFormURL == '') {
					modifiedFormURL = tokens[i];
				} else {
					modifiedFormURL = modifiedFormURL + "&" + tokens[i];
				}
			} else if (tokens[i].indexOf('langId=') > 0) {
				if (i==0) {
					//langId is the first token next to ?
					modifiedFormURL = tokens[0].substring(0,tokens[0].indexOf('langId='));
				} else {
					modifiedFormURL = modifiedFormURL + "&";
				}
				modifiedFormURL = modifiedFormURL + "langId=" + document.getElementById('languageSelection').options[document.getElementById('languageSelection').selectedIndex].value;
			}
		}
	}
	modifiedFormURL = switchLanguageCurrencyFilter(modifiedFormURL);
	document.forms[formName].URL.value = modifiedFormURL;
	document.forms[formName].languageSelectionHidden.value = document.getElementById('languageSelection').options[document.getElementById('languageSelection').selectedIndex].value;
	
	//hide pop up and submit the form
	dijit.byId('widget_language_and_currency_popup').hide();
	//delete buyOnBehalfOf cookie if exists
	//if (typeof(GlobalLoginShopOnBehalfJS) != 'undefined' && GlobalLoginShopOnBehalfJS != null ){
	//	GlobalLoginShopOnBehalfJS.deleteBuyerUserNameCookie();
	//}
	if (typeof changeStoreViewLanguage == 'function') { 
		changeStoreViewLanguage(document.forms[formName].languageSelectionHidden.value); 
	}
	document.getElementById(formName).submit();
}

/**
 * This function checks replaces url in a exclusion list with string from the replacement list
 * @param url The url to process
*/
function switchLanguageCurrencyFilter(url) {
    var filterList = [];
    
    // Add any new exclude and replace view name in filterList
    // exclude UserRegistrationAdd in URL and replace with UserRegistrationForm?new=Y
    var paramList = [{"key": "registerNew", "value": "Y"}];
    filterList.push({"exclude": "UserRegistrationAdd", "replace": "UserRegistrationForm", "param": paramList});
    
    for (var i=0; i<filterList.length; i++) {
        if (url.indexOf(filterList[i].exclude) > 0) {
            url = url.replace(filterList[i].exclude, filterList[i].replace);
            if (filterList[i].param != undefined) {
                var urlParamList = filterList[i].param;
                for (var j=0; j<urlParamList.length; j++) {
                    url = appendToURL(url, urlParamList[j].key, urlParamList[j].value, false);
                }
            }
            break;
        }
    }
    return url;
}

/**
 * This function check the <code>url</code> <code>paramterName</code> pair against the URLConfig exclusion list.
 * @param url The url to send request.
 * @param parameterName The name of the parameter to be sent with request.
 * @returns {Boolean} True if the parameter and url is not in an exclusion list, false otherwise.
 */
function isParameterExcluded(url, parameterName){
	try{
	if(typeof URLConfig === 'object'){
		if (typeof URLConfig.excludedURLPatterns === 'object'){
			for ( var urlPatternName in URLConfig.excludedURLPatterns){
				var exclusionConfig = URLConfig.excludedURLPatterns[urlPatternName];
				var urlPattern = urlPatternName;
				if(typeof exclusionConfig === 'object'){
					if(exclusionConfig.urlPattern){
						urlPattern = exclusionConfig.urlPattern;
					}
					console.debug("URL pattern to match : " + urlPattern);
					urlPattern = new RegExp(urlPattern);
					
					if(url.match(urlPattern)){
						var excludedParametersArray = exclusionConfig.excludedParameters;
						for(var excludedParameter in excludedParametersArray){
							if(parametername == excludedParameter){
								return true;
							}
						}
					}
				}
			}
		} else {
			console.debug("The parameter " + parameterName + " is not excluded");
		}
	} else {
		console.debug("No URLConfig defined.")
	}
	} catch (err){
		console.debug("An error occured while trying to exclude " + err);
	}
return false;
}

/**
 *	The utility function to append name value pair to a URL
 * 	@param allowMultipleValues (boolean) Indicates whether a parameterName can have multiple values or not, default value is <code>false</code>.
 * 	@returns url The updated url.
 */
function appendToURL(url, parameterName, value, allowMultipleValues){	
	allowMultipleValues = (null == allowMultipleValues) ? false : allowMultipleValues;
	var paramPattern = new RegExp(parameterName + "=[^&]+");
	var newParamString = parameterName + "=" + value;
	if ( url.indexOf(newParamString) != -1 ) {
		//console.debug("parameter value pair " + newParamString + " is already indcluded.");
	} else if (!paramPattern.test(url) || allowMultipleValues){
		if (url.indexOf('?')== -1 ){
			url = url + '?';
		}else{
			url = url + '&';
		}
		url = url + newParamString;
	} else {
		// replace it if the old one does not match with the one in wcCommonRequestParameters, possible caching case?
		url = url.replace(paramPattern, newParamString);
		//console.debug("replace " + url.match(paramPattern) + " with " + newParamString);
	} 
	return url;
}


/**
 * The function append parameters, such as <code>forUserId</code>, in <code>wcCommonRequestParameters</code> 
 * as URL parameters to the give URL.
 * @param allowMultipleValues (boolean) Indicates whether a parameterName can have multiple values or not, default value is <code>false</code>
 * @returns url The updated url.
 */
function appendWcCommonRequestParameters(url, allowMultipleValues){
	allowMultipleValues = (null == allowMultipleValues) ? false : allowMultipleValues;
	if(typeof wcCommonRequestParameters === 'object'){
		//console.debug("Common parameters = " + dojo.toJson(wcCommonRequestParameters));	
		for(var parameterName in wcCommonRequestParameters){
			if(!isParameterExcluded(url, parameterName)){
				url = appendToURL(url, parameterName, wcCommonRequestParameters[parameterName], allowMultipleValues);
			} 
			//else {
			//console.debug("parameter " + parameterName + " is excluded.");
			//}
		}
	}
	return url;
}

/**
 *	Update the form the <code>wcCommonRequestParameters</code>.
 * 	@param form The form to update.
 */
function updateFormWithWcCommonRequestParameters(form, allowMultipleValues) {
	allowMultipleValues = (null == allowMultipleValues) ? false : allowMultipleValues;
	if(typeof wcCommonRequestParameters === 'object'){
		//console.debug("Common parameters = " + dojo.toJson(wcCommonRequestParameters));	
		for(var parameterName in wcCommonRequestParameters){
			if(form.action !== undefined && null !== form.action && !isParameterExcluded(form.action, parameterName) ){
				var exist = false;
				dojo.query("input[name=" + "'" + parameterName + "']", form).forEach(function(param){
					if (param.value == wcCommonRequestParameters[parameterName]){
						exist = true;
						//console.debug("parameter " + parameter + " with same value alreday exist.")
					} else if (!allowMultipleValues) {
						form.removeChild(param);
					}
				});
				if (!exist ) {
					if (form.method == 'get') {
						//the parameter in the URL for form get is not read, need to use hidden input.
						dojo.create("input", {name: parameterName, type:'hidden', value: wcCommonRequestParameters[parameterName]}, form);
					} else {
						//post action url probably already has this parameter, use 'appendToURL' to handle duplication
						form.action = appendToURL(form.action, parameterName, wcCommonRequestParameters[parameterName], allowMultipleValues);
					}
				}
			}
		}
	}
}

function addAuthToken(form){
	try{
		if(dojo.byId("csrf_authToken") != null){
			dojo.create("input", {name: "authToken", type:'hidden', value: dojo.byId("csrf_authToken").value}, form);
		} else {
			console.debug("auth token is missing from the HTML DOM");
		}
		return true;
	} catch (err){
		console.debug("An error occured while trying to add authToken to the form..." + err);
	}
	return false;
}

/**
 *	Process the form update and submit. All forms' submission are recommended to be done this function.
 * 	@param form The form to submit.
 */
function processAndSubmitForm (form) {
	updateFormWithWcCommonRequestParameters(form);
	addAuthToken(form);
	form.submit();
}


function getCommonParametersQueryString(){
	return "storeId="+WCParamJS.storeId+"&langId="+WCParamJS.langId+"&catalogId="+WCParamJS.catalogId;
}

/** 
 *  Handle service requests after user login for these scenarios:
 *	- timeout while trying to execute an Ajax request
 *	- need authentication while trying to execute an Ajax request
 *
 *	The nextUrl is a parameter returned from wc dojo framework when an error has occured when excuting an AJAX action. 
 *	It specifies the next Ajax action to be performed after the user has logged on
 **/
	
 	/**
 	* This function checks to see if the passed in URL contains a parameter named 'finalView'. If it does, it will construct a new URL
 	* using value from 'finalView' paramter as the view name
 	* @param {String} myURL The URL to check if it contains finalView param
 	*/
	function getFinalViewURL(myURL) {
		var finalViewBeginIndex = myURL.indexOf('finalView');

		// check if finalView parameter is passed in the URL
		if (finalViewBeginIndex != -1){
			
			// index after parameter 'finalView', when it is -1, that means final view is the last paramter in the URL
			var finalViewEndIndex = myURL.indexOf('&', finalViewBeginIndex);
			if (finalViewEndIndex == -1) {
				var finalViewName = myURL.substring(finalViewBeginIndex + 10);
			} else {
				var finalViewName = myURL.substring(finalViewBeginIndex + 10, finalViewEndIndex);
			}
			var originalActionEndIndex = myURL.indexOf('?');
	
			// firstPartURL is everything after the '?' sign and before finalView parameter
			var firstPartURL = myURL.substring(originalActionEndIndex + 1, finalViewBeginIndex);
			// secondPartURL is everything after finalView parameter
			if (finalViewEndIndex == -1) {
				var secondPartURL = "";
			} else {
				var secondPartURL = myURL.substring(finalViewEndIndex);
			}
			
			// to make things simple, remove all leading and trailing '&' for firstPartURL and secondPartURL
			if (firstPartURL.charAt(firstPartURL.length - 1) == '&') {
				firstPartURL = firstPartURL.substring(0, firstPartURL.length-1);
			}
			if (firstPartURL.charAt(0) == '&') {
				firstPartURL = firstPartURL.substring(1);
			}
			if (secondPartURL.charAt(secondPartURL.length - 1) == '&') {
				secondPartURL = secondPartURL.substring(0, secondPartURL.length-1);
			}
			if (secondPartURL.charAt(0) == '&') {
				secondPartURL = secondPartURL.substring(1);
			}
						
			var finalURL = "";
			if (firstPartURL != "") {
				finalURL = finalViewName + '?' + firstPartURL;
				if (secondPartURL != "") {
					finalURL = finalURL + '&' + secondPartURL;
				}
			} else {
				finalURL = finalViewName + '?' + secondPartURL;
			}			
			return finalURL;
		} else {
			return "";
		}
	}
	
	wc.service.declare({
		id: "MyAcctAjaxAddOrderItem",
		actionId: "AjaxAddOrderItem",
		url: "",
		formId: ""
		,successHandler: function(serviceResponse) {
			MessageHelper.hideAndClearMessage();
			MessageHelper.displayStatusMessage(storeNLS["SHOPCART_ADDED"]);
			setCookie("WC_nextURL_"+WCParamJS.storeId, null, {expires:-1,path:'/', domain:cookieDomain});
			cursor_clear();
		}
		,failureHandler: function(serviceResponse) {
			if (serviceResponse.errorMessage) {
			 	if(serviceResponse.errorMessageKey == "_ERR_NO_ELIGIBLE_TRADING"){
			 		MessageHelper.displayErrorMessage(storeNLS["ERROR_CONTRACT_EXPIRED_GOTO_ORDER"]);
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

	});
 	
	wc.service.declare({
		id: "MyAcctGenericService",
		actionId: "",
		url: "",
		formId: ""
		,successHandler: function(serviceResponse) {
			setCookie("WC_nextURL_"+WCParamJS.storeId, null, {expires:-1,path:'/', domain:cookieDomain});
			MessageHelper.hideAndClearMessage();
			finalViewURL = getFinalViewURL(this.url);
			if (finalViewURL != "") {
				document.location.href = finalViewURL;
			} else {
				if(serviceResponse.status == 'addedToWishList')
					MessageHelper.displayStatusMessage(MessageHelper.messages["MA_SL_ITEM_ADDED_SUCCESSFULLY"]);	
				else
					MessageHelper.displayStatusMessage(storeNLS["MYACCOUNT_ACTION_PERFORMED"]);
				
				cursor_clear();
			}
		}
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

	});
 	
	function invokeItemAdd(inUrl) {
		wc.service.getServiceById("MyAcctAjaxAddOrderItem").url=inUrl;
		var addToCartParams = [];
		// PasswordRequestAuthenticated is required by PasswordRequestCmdImpl - to indicate password is already entered by user. As we are in the my
		// account page, password is already entered and accepted.
		addToCartParams.PasswordRequestAuthenticated = 'TRUE';

		/*For Handling multiple clicks. */
		if(!submitRequest()){
			return;
		}
		cursor_wait();
		setCookie("WC_nextURL_"+WCParamJS.storeId, null, {expires:-1,path:'/', domain:cookieDomain});
		wc.service.invoke("MyAcctAjaxAddOrderItem", addToCartParams);
	}
	function invokeOtherService(inUrl) {
		wc.service.getServiceById("MyAcctGenericService").url=inUrl;
		var params = [];
		params.PasswordRequestAuthenticated = 'TRUE';
		
		/*For Handling multiple clicks. */
		if(!submitRequest()){
			return;
		}			
		cursor_wait();
		setCookie("WC_nextURL_"+WCParamJS.storeId, null, {expires:-1,path:'/', domain:cookieDomain});
		wc.service.invoke("MyAcctGenericService", params);
	}
	
	/**
	 * After successful login and setting a contract in session, we need to process the action that the shopper
	 * was performing before signing in. It will do nothing if shopper was not trying to perform any actions. 
	 */
	function processNextURL() {
		var myNextURL = getCookie("WC_nextURL_"+WCParamJS.storeId);
		if(myNextURL != undefined && myNextURL.length > 0){
			myNextURL = myNextURL.replace(/&amp;/g, "&");
			if(myNextURL.indexOf('AjaxRESTOrderItemAdd') != -1){
				invokeItemAdd(myNextURL);
			} else {
				invokeOtherService(myNextURL);
			}
		}
		
	}
	
	/**
	 * In order to handle the case that IE handles cookie domain differently from other browsers,
	 * Use this centerlized function to handle cookie value assignment and ingore domain prop for cookie 
	 * creation when domain name is an empty string.
	 */
	function setCookie(cookieName, cookieVal, props)
	{
		if(!props){
			dojo.cookie(cookieName, cookieVal);
		}
		else{
			var cookieProps = props;
			for (var propName in cookieProps) {
				  if (!cookieProps[propName]) {
				    delete cookieProps[propName];
				  }
			}
			dojo.cookie(cookieName, cookieVal, cookieProps);
		}
	}
	
	function getBaseTextDir() {
		// summary:
		//		returns the value of the "baseTextDirection" preference.		
		var btd = getCookie(_BTD_PREFS);
		if (!btd){
			return "";
		}
		return btd;
	}

	function setBaseTextDir(btd) {
		// summary:
		//		Sets the value of the baseTextDirection" preferences. 		
		var oldItem = getCookie(_BTD_PREFS);
		if (oldItem != btd){
			setCookie(_BTD_PREFS, btd.toLowerCase());		
		}
	}
	
	function isRTLValue(stringValue) {
		for (var ch in stringValue) {
			if (isBidiChar(stringValue.charCodeAt(ch)))
				return true;
			else if(isLatinChar(stringValue.charCodeAt(ch)))
				return false;        
     	}
     	return false;
	}

	function isBidiChar(c)  {
    	if (c >= 0x05d0 && c <= 0x05ff)
        	return true;
    	else if (c >= 0x0600 && c <= 0x065f)
        	return true;
    	else if (c >= 0x066a && c <= 0x06ef)
        	return true;
    	else if (c >= 0x06fa && c <= 0x07ff)
        	return true;
    	else if (c >= 0xfb1d && c <= 0xfdff)
        	return true;
    	else if (c >= 0xfe70 && c <= 0xfefc)
        	return true;
    	else
        	return false;
	}

	function isLatinChar(c){
    	if((c > 64 && c < 91)||(c > 96 && c < 123))
 			return true;
		else            
    		return false;    
	}
	
	function resolveBaseTextDir(value, txtDir) {
		if (txtDir == "auto") {
			if (isRTLValue(value)) {
				return "rtl";
			} else {
				return "ltr";
			}
		} 
		else {
			return txtDir;
		}
	}
	
	function handleTextDirection(requiredElement) {
		var txtDir = getBaseTextDir(); 
		if (requiredElement != null && txtDir != "") {
			if (requiredElement.tagName == 'INPUT' || requiredElement.tagName == 'TEXTAREA') {
				requiredElement.style.direction = resolveBaseTextDir(requiredElement.value, txtDir);								
			}
		}
	}
	
	function enforceTextDirectionOnPage() {
		var txtDir = getBaseTextDir(); 
		if (txtDir != "") {
			var t = dojo.query(".bidiAware");
			for(var i = 0; i < t.length; i++) {
				var element = t[i];							
				element.dir = element.style.direction = resolveBaseTextDir(element.value || element.text || element.outerText || element.innerHTML, txtDir);
			}
		}		
	}

	/**
	* Common failure handler function which can be used with most of the
	* service definitions.
	* This function displays errorMessage present in serviceResponse object. 
	* If errorMessage is null, then it displays errorMessageKey.
	*/
	function commonServiceFailureHandler(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} else {
			if (serviceResponse.errorMessageKey) {
				MessageHelper.displayErrorMessage(serviceResponse.errorMessageKey);
			}
		}
		cursor_clear();
	}


	/**
	* Success handler function used with services which does URL chaining.
	* This function retrieves the next URL in the URLChain and invokes ajax service
	* with appropriate input parameters specified for the URL.
	* If the next URL is specified with requestType = 'GET', then it just
	* redirects the page to nextURL without invoking any further service
	*/
	function successHandlerForURLChainingService(serviceResponse){
		console.debug("Success Handler of AjaxCustomServiceForURLChaining", serviceResponse);
		if(this.postRefreshHandlerParameters != null && this.postRefreshHandlerParameters != ''){
			var nextServiceURL = "";
			// Retrieve the first element from the array...
			nextServiceURLObject = this.postRefreshHandlerParameters.splice(0,1)[0];
			console.debug("nextServiceURLObject ",nextServiceURLObject);

			var params = [];
			if(nextServiceURLObject != null && typeof(nextServiceURLObject) != 'undefined'){
				var nextServiceURL = nextServiceURLObject["URL"];
				var requestType = nextServiceURLObject["requestType"];
				var requestParams = nextServiceURLObject["requestParams"];
				console.debug("nextServiceURL ", nextServiceURL);
				console.debug("requestType ", requestType);
				console.debug("requestParams ", requestParams);
			}
			if(nextServiceURL != "") {
				if(requestType == "GET"){
					if(nextServiceURL.indexOf("?") == -1){
						nextServiceURL = nextServiceURL + "?" + getCommonParametersQueryString();
					}
					for(var key in requestParams){
						nextServiceURL = nextServiceURL+"&"+ key +"=" + requestParams[key];
					}
					document.location.href = nextServiceURL;
				} else {
					var service = getCustomServiceForURLChaining(nextServiceURL, this.postRefreshHandlerParameters);
					wc.service.invoke(service.id, requestParams);
				}
			} else {
				console.debug("End of URL chaining with AjaxCustomServiceForURLChaining service");
				//TODO.. should we show generic success message here ???
			}
		}
	}

	/**
	* This is a common service which can be used to chain 'N' number of service calls.
	*
	* Input parameters to this function are:
	* @url -> The URL for this service definition.
	* @postRefreshHandlerParameters -> JSON object specifying the chained service URLS along with input parameters for each of the service URLs.
	* @formId -> Form that needs to be submitted with the initial service invocation.
	* @return -> wc.service object.
	* 
	* Example code:
	*
	* // Define the initial URL
	* initialURL = 'AjaxPersonChangeServiceAddressAdd'; 
	*
	* // Form to be submitted along with initial request.
	* formId = "addressForm"
	*
	* // Define subsequent set of chained requests
	* var postRefreshHandlerParameters = {};
	* postRefreshHandlerParameters.push({"URL":"AjaxRESTOrderPIDelete", "requestParams":{"piId":"12345"}});
	* postRefreshHandlerParameters.push({"URL":"AjaxRESTOrderItemUpdate", "requestParams":{calculationUsage:"-1,-2,-3,-4,-5,-6,-7", calculateOrder:"1", orderItemId="10001"}});
	* postRefreshHandlerParameters.push({"URL":"DOMOrderShippingBillingView","requestType":"GET", "requestParams":{"payInStore":1}}); 
	*
	* // Get the service definition.
	* var service = getCustomServiceForURLChaining(initialURL,postRefreshHandlerParameters,formId);
	*
	* // Invoke the service.
	* wc.service.invoke(service.id, null);
	*	
	* With above sample code, the request chain will be:
	* Request 1: POST : AjaxPersonChangeServiceAddressAdd?<addressForm parameters>
	* Request 2: POST : AjaxRESTOrderPIDelete?piId=12345
	* Request 3: POST : AjaxRESTOrderItemUpdate?calculationUsage=-1,-2,-3,-4,-5,-6,-7&calculateOrder=1&orderItemId=10001
	* Request 4: GET  : DOMOrderShippingBillingView?payInStore=1
	*/
	function getCustomServiceForURLChaining(url, postRefreshHandlerParameters,formId){
		var service = wc.service.getServiceById('AjaxCustomServiceForURLChaining');

		if(service == null || service == undefined){
			console.debug("Start creating AjaxCustomServiceForURLChaining");
			wc.service.declare({
				id: "AjaxCustomServiceForURLChaining",
				actionId: "AjaxCustomServiceForURLChaining",
				url: "",
				formId: "",
				successHandler: successHandlerForURLChainingService,
				failureHandler: commonServiceFailureHandler
			});
			service = wc.service.getServiceById('AjaxCustomServiceForURLChaining');
		}

		if(url != null && url != 'undefined'){
			if(!url.startsWith("http")){
				service.url = getAbsoluteURL() + url;
			} else {
				service.url = url;
			}
		}
		if(postRefreshHandlerParameters != null && postRefreshHandlerParameters != 'undefined'){
			service.postRefreshHandlerParameters = postRefreshHandlerParameters;
		} else {
			service.postRefreshHandlerParameters = null;
		}
		if(formId != null && formId != 'undefined'){
			service.formId = formId;
		} else {
			service.formId = null;
		}
		console.debug("Return AjaxCustomServiceForURLChaining", service);
		return service;
	}