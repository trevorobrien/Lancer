//-----------------------------------------------------------------
// Licensed Materials - Property of IBM
//
// WebSphere Commerce
//
// (C) Copyright IBM Corp. 2007, 2015 All Rights Reserved.
//
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with
// IBM Corp.
//-----------------------------------------------------------------

/**
 *@fileOverview This javascript file defines all the javascript functions used to display
 *and handle the information messages, error messages.
 */

if(typeof(MessageHelper) == "undefined" || !MessageHelper || !MessageHelper.topicNamespace){

/**
 * @class The MessageHelper class contains variables and functions that are used
 * to initialize, display and handle informational and error message.
 */
	MessageHelper = {
		/**A variable that contains all the messages to be displayed*/
		messages: {},
		
		/**
     * internal variable to keep track of the current element id that has
     * an error tooltip assigned to it */
		identifier: "",
		
		/**Reference to the form error handler tooltip object */	
		tooltip: null,		
		/**
     * internal variable to keep track of the element id that needs to
     * give focus to on dialog dismissal */
		focusElement: "",	

    /**
     * returns the current year
     * @return (int) the current year
     */
		getCurrentYear: function(){
			return new Date().getFullYear();
		}, 

     /**
     * returns the current month. January is 1, and December is 12.
     * @return (int) the current month
     */
		getCurrentMonth: function(){
       return new Date().getMonth()+1;
		}, 

     /**
     * returns the current day of the current month, starting from 1.
     * @return (int) the current day
     */
		getCurrentDay: function(){
       return new Date().getDate();
		}, 

    /**
     *
     *summary: retrieves the value of the property from a render context
		 *description: This function retrieves the value of the property whose name is propertName
		 *from the given context.
     *
     * @param (wc.render.Content) content The context in which the properties
     * belong to.
     * @param (string) propertyName The property to be retrieved
		 * @return (string) null if the context is null. undefined if the property is not found.
		 * otherwise, the value of the property int he given context.
     */
		getRenderContextProperty : function(/*wc.render.Context*/context, /*String*/propertyName){
			
			console.debug("enter getRenderContextProperty with propertyName = "+propertyName);
			if(context == null){
				console.debug("context is null. Return null...");
				return null;
			}
			
			var result = context.properties[propertyName]
			console.debug("the found property value is: "+result);
			
			return result;	
		}, 
				
		/**
     * This function is used to initialize the messages object with all the 
     * required messages. It is used to setup a JS object with any key/value.
     * @param (string) key The key used to access this message.
     * @param (string) msg The message in the correct language.
     *
     */
		setMessage:function(key, msg) {
			this.messages[key] = msg;
		},
	/**
     * This function is used to initialize the element that needs to give focus to on dialog dismissal.
     * @param (string) element The element needs to give focus to.
     *
     */			
		setFocusElement:function(element){
			this.focusElement = element;
		},		

	
	
	/**
	 * Use dojo.fadeIn and dojo.fadeOut to display error and informative messages in the store.
	 * @param (int) topOffset how far from the top the message display area will be displayed. 
	 */
		showHideMessageArea:function(topOffset){
			cursor_clear();
			if (topOffset==null || topOffset==undefined) {
				topOffset = 0;
			}
			var node = dojo.byId("MessageArea");
			
			var fadeInAnimArgsArray = new Array();
			fadeInAnimArgsArray["node"] = node;
			fadeInAnimArgsArray["duration"] = 200;
			fadeInAnimArgsArray["delay"] = 0;
			
		//	var fadeOutAnimArgsArray = new Array();
		//	fadeOutAnimArgsArray["node"] = node;
		//	fadeOutAnimArgsArray["duration"] = 500;
		//	fadeOutAnimArgsArray["delay"] = 7000;
		//	fadeOutAnimArgsArray["onEnd"] = function(){
		//		dojo.style(node, "display", "none");
		//		if(dijit.byId("MessageArea_ACCE_Title") != null) {
		//			dijit.byId("MessageArea_ACCE_Title").style.display = "none";
		//		}
		//		dojo.style(node, "opacity", 100);	
		//	};
			
			// set message area to alpha and then make it display block
			dojo.style(node, "opacity", 0);
			if(dijit.byId("MessageArea_ACCE_Title") != null) {
				dijit.byId("MessageArea_ACCE_Title").style.display = "block";
			}
			dojo.style(node, "display", "block");
			
			// fade in
			var fadeInAnim = dojo.fadeIn(fadeInAnimArgsArray);
			
			// fade out and when end the display set to none and opacity set to 100
		//	var fadeOutAnim = dojo.fadeOut(fadeOutAnimArgsArray);
			
			// sequence run fade in and out
			//dojo.fx.chain([fadeInAnim, fadeOutAnim]).play();	
			//run fade in.
			fadeInAnim.play();
		},
	
	/**
	 * Use dojo.fadeOut to hide error and informative messages in the store.
	 */
		hideMessageArea:function(){
			cursor_clear();
			var focusOnElement = "";
			if(dojo.byId(this.focusElement)!=null){
				focusOnElement = dojo.byId(this.focusElement);
			}
			var node = dojo.byId("MessageArea");
			var fadeOutAnimArgsArray = new Array();
			fadeOutAnimArgsArray["node"] = node;
			fadeOutAnimArgsArray["duration"] = 500;
			fadeOutAnimArgsArray["onEnd"] = function(){
				dojo.style(node, "display", "none");
				if(dijit.byId("MessageArea_ACCE_Title") != null) {
					dijit.byId("MessageArea_ACCE_Title").style.display = "none"
				}
				dojo.style(node, "opacity", 100);
				if(dojo.byId(focusOnElement)!=null){
					focusOnElement.focus();	
				}			
			};
			dojo.fadeOut(fadeOutAnimArgsArray).play();
			dojo.byId('ErrorMessageText').innerHTML = "";
			this.focusElement = "";				
		},
		
    /**
     * This function is used to display the error messages to the user. 
     * @param (string) msg The error/information message to be displayed
     *
     * @return (element) a HTML element that contains the error message. 
     *
     */
		displayErrorMessage:function(msg,excludeErrorLabel,forceInPage){
			var tealiumErrorObj = {};
			var element = dojo.byId('pageLevelMessage');
			if(forceInPage!=true && O.isOpen()){
				element = dojo.byId('overLayMessage');				
			}
			var errorMessage = '';
			if(element) {

				if (msg instanceof Array && msg.length == 1) {
					errorMessage = msg[0];
					errorMessage = $('<div/>').html(U.decodeHTML(errorMessage)).text();
					element.innerHTML = (excludeErrorLabel ? '' : '<b>Error: </b>') + errorMessage;
				} else {
					element.innerHTML = (excludeErrorLabel ? '' : '<b>Error: </b>') + U.decodeHTML(msg);
				}
				
				if(dojo.hasClass(element, 'pageSuccessMessage'))
					dojo.removeClass(element.id, 'pageSuccessMessage');

				dojo.addClass(element.id, 'pageErrorMessage');
				element.style.display = "block";
				
				if(forceInPage!=true && O.isOpen()){
					O.scrollTo(0)
				} else {
					U.scrollTo(0,0);
				}
			}
			console.debug('error message');
			tealiumErrorObj.error_message=msg;
			PVHTealium.handleTealiumError(tealiumErrorObj);
		},
		
    /**
     * This function is used to display the informative messages to the user.
     * @param (string) msg The status message to be displayed.
     * @param (int) topOffset how far from the top of the browser the message will be displayed. 
     * @return (element) a HTML element that contains the status message.
     */
		displayStatusMessage:function(msg,topOffset)
		{
			var element = dojo.byId('pageLevelMessage');
			if(element) {
				element.innerHTML = msg;
				
				if(dojo.hasClass(element, 'pageErrorMessage'))
					dojo.removeClass(element.id, 'pageErrorMessage');
				
				dojo.addClass(element.id, 'pageSuccessMessage');
				element.style.display = "block";
				if(U.isMobile())
				{
					var $box=$('#box');
					var top=$box.length ? $box.offset().top-10 : 0; 
				} else var top=0;
				
				U.scrollTo(top,0);
			}
		},

    /**
     * This function is used to hide and clear the message display area in
     * the page.
     */
		hideAndClearMessage:function(){
			MessageHelper.clearAllErrorMessages();
		},
	
	clearMessage:function(messageId){
		
		var element = dojo.byId(messageId);
		if(element)
			element.style.display = "none";
	},		
		
	/**
	 * This function is used to re-adjust the coordinates of the message display area on the page. Its location is relative to the "page" element.
	 * @param (int) topOffset how far from the top the message display area will be displayed. 
	 */
		adjustCoordinates:function(topOffset){
			if(dojo.style("MessageArea", "display") != "none"){
				var page = dojo.byId("page");
				var node = dojo.byId("MessageArea");
				if(page != null && node != null){
					var coords = dojo.coords(page, true);
					var width = coords.w;
					if(dojo.isSafari){
						width = dojo.style('page', 'width');
					}
					
					if (topOffset==null || topOffset==undefined) {
						topOffset = 0;
					}
					
					dojo.style(node, {
						"width": width + 20+ "px",
						"left": coords.x - 10 + "px",
						"top": (coords.y + topOffset) + "px"
					});
				}
			}
		},

    /**
     * This function will show the an error message tooltip
     * around the input field with the problem.
     *
     * The function assumes the "serviceResponse" is the
     * JSON object from a WebSphere Commerce exception. The error
     * field is in the serviceResponse.errorMessageParam and the
     * error message is in the serviceResponse.errorMessage.
     *
     * @see MessageHelper.formErrorHandleClient
     * @param (object) serviceResponse The JSON object with the error data.
     * @param (string) formName The name of the form where the error field is.
     * 
     */
		formErrorHandle:function(serviceResponse,formName){

			this.formErrorHandleClient(serviceResponse.errorMessageParam, serviceResponse.errorMessage);

	  	},


		/**
     * This function will show the an error message tooltip
     * around the input field with the problem.
     *
     * This function will check for the emptiness of the required
     * filed and displays the "errorMessage" related to that field as a tooltip.
     * The tooltip will be closed on focus lost.
     *
     * @param (string) id The identifier for the filed in the form.
     * @param (string) errorMessage The message that should be displayed to the user.
     */
	  	formErrorHandleClient:function(id,errorMessage,errorParentId)
		{
	  		var tealiumErrorObj = {};
			if(errorMessage==null)
			{	
				console.debug("formErrorHandleClient: The error message is null.");
				return;
			}
			
			var $element=$(U.toId(id));
			if($element.length)
			{
				$('.fieldErrorMessage').remove();
				$('.fieldError').removeClass('fieldError');
				$element.parent().addClass('fieldError');
				if($element.is('input,select')) $element.focus();
				
				var $fieldErrorMessage=$("<div id='fieldErrorMessage' class='fieldErrorMessage' >"+errorMessage+"</div>");
				var $errorParentId=errorParentId ? $(U.toId(errorParentId)) : null;
				if(U.isNotNull($errorParentId)) {
					$errorParentId.attr(U.ARIA.DESCRIBED_BY, 'fieldErrorMessage');
					$errorParentId.prepend($fieldErrorMessage);
				}
				else {
					$element.attr(U.ARIA.DESCRIBED_BY, 'fieldErrorMessage');
					$element.before($fieldErrorMessage);
				}
				tealiumErrorObj.error_message=errorMessage;
				PVHTealium.handleTealiumError(tealiumErrorObj);
			}
		},
		
		/**
	     * This function will show the an error message tooltip
	     * around the input field with the problem and highlight input in question.
	     *
	     * This function will check for the emptiness of the required
	     * filed and displays the "errorMessage" related to that field as a tooltip.
	     * The tooltip will be closed on focus lost.
	     *
	     * @param (string) id The identifier for the input in the form to be highlighted.
	     * @param (string) errorParentId The identifier for action button to display message in.
	     * @param (string) errorMessage The message that should be displayed to the user.
	     */
		highlightFormErrorHandleClient:function (id,errorParentId, errorMessage)
		{
			var $element=$('#'+id);
	  		if (errorMessage == null){
				console.debug("formErrorHandleClient: The error message is null.");
				return;
			}
	  		
			if($element.length)
			{
				/* Add highlight to the current element */
				$element.addClass('fieldError');

				/* set focus */
				if(id != 'addToCartLinkAjax' && id != 'pdpAdd2CartButton') $element.focus();
				
				$('#'+errorParentId).attr(U.ARIA.DESCRIBED_BY, 'fieldErrorMessage');
				dojo.place("<div id='fieldErrorMessage' class='fieldErrorMessage'>"+errorMessage+"</div>",errorParentId, 'before');
			}
		},

		/**
		 * This function is used to hide and clear all error messages
		 * 
		 */
		clearAllErrorMessages : function() {
			MessageHelper.clearFieldLevelErrorMessage();
			MessageHelper.clearPageLevelErrorMessage();
		
			//clearing ADA error attributes
			$('[aria-describedby="fieldErrorMessage"]').removeAttr(U.ARIA.DESCRIBED_BY);
		},
		
		/**
	     * This function is used to hide and clear field level error messages
	     *
	     */
		clearFieldLevelErrorMessage:function(){

			/* remove field level error messages if present */
			dojo.query(".fieldErrorMessage").orphan();

			/* Remove any error highlight already present */
			$('.fieldError').removeClass('fieldError');

			dojo.query('.orderItemErrorMsg', document).forEach(function(tag) {
				dojo.byId(tag.id).innerHTML = "";
			});
		},
			
	    /**
	     * This function is used to hide and clear page level error messages
	     *
	     */
		clearPageLevelErrorMessage:function()
		{
			$('#pageLevelMessage, #overLayMessage, #addressWarningMessage').empty().hide();
		},
		
		/**
		 * This function hides and destroys the current form error handler
		 * tooltip that is displayed and clears the identifier that is currently
		 * tracked.
		 */		
		hideFormErrorHandle:function(){
			if(this.tooltip != null){
				this.tooltip.destroyRecursive();
				this.tooltip = null;
				this.clearCurrentIdentifier();
			}
		},		

		/**
     * This function clears the internal variable that has the element id
     * with the error tooltip.
     * 
     */
		clearCurrentIdentifier:function(){
		
			this.identifier = "";
	  },

     /**
      * This function is used to override any of the default functions
      * associated with the events. Ex: Tooltip widget tracks onMouseOver event
      * and display the tooltip. To remove this association,
      * tooltip widgets onMouseOver function will be overridden by this empty
      * function.
      * 
      * It is an empty implementation which does nothing.
      *
      * @param (string) event  The event which triggers this function. 
      */
	  emptyFunc:function(event){
		 
	  },



    /**
     * Checks whether a string contains a double byte character.
     *
     * @param (string) target the string to be checked
     * @return (boolean) true if target contains a double byte char;
     * false otherwise
     */
		containsDoubleByte:function (target) {
		
				var str = new String(target);
				var oneByteMax = 0x007F;

				for (var i=0; i < str.length; i++){
					chr = str.charCodeAt(i);
					if (chr > oneByteMax) {
						return true;
					}
				}
				return false;
		},

    /**
     * This function validate email address. It does not allow double byte
     * characters in the email address.
     *
     * @return (boolean) true if the email address is valid; false otherwise
     *
     * @param (string) strEmail the email address string to be validated
     */
		isValidEmail:function(strEmail){

			if (MessageHelper.containsDoubleByte(strEmail)){
				return false;
			}
			if (!MessageHelper.checkEmailWithW3RegExp(strEmail)){
				return false;
			}
				if (strEmail.length < 5) {
					 return false;
				}else{
					if (strEmail.indexOf(" ") > 0){
								return false;
						}else{
							if (strEmail.indexOf("@") < 1) {
										return false;
								}else{
									if (strEmail.lastIndexOf(".") < (strEmail.indexOf("@") + 2)){
												return false;
										}else{
												if (strEmail.lastIndexOf(".") >= strEmail.length-2){
													return false;
												}
										}
								}
						}
				}
				return true;
		},
		
		/**
		 * Validates the input email using w3 regex 
		 *
		 * @param (string) email the string to be checked
		 * @return (boolean) true if the email is valid;
		 * false otherwise
		 */
		checkEmailWithW3RegExp:function (email) {

			var w3RegExpEmail = /^[a-zA-Z0-9.!#$%&�*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
			return w3RegExpEmail.test(email);
		},

		/**
     * This function will check if the number of bytes of the string
     * is within the maxlength specified.
     *
     * @param (string) UTF16String the UTF-16 string
     * @param (int) maxlength the maximum number of bytes allowed in your input
     *
     * @return (boolean) false is this input string is larger than maxlength
		 */
		isValidUTF8length: function(UTF16String, maxlength) {
			if (this.utf8StringByteLength(UTF16String) > maxlength) return false;
			else return true;
		},

    /**
     * This function will count the number of bytes represented in a UTF-8
     * string.
     *
     * @param (string) UTF16String the UTF-16 string you want a byte count of
     * @return (int) the integer number of bytes represented in a UTF-8 string
     */
		utf8StringByteLength: function(UTF16String) {

			if (UTF16String === null) return 0;
			
			var str = String(UTF16String);
			var oneByteMax = 0x007F;
			var twoByteMax = 0x07FF;
			var byteSize = str.length;
			
			for (i = 0; i < str.length; i++) {
				chr = str.charCodeAt(i);
				if (chr > oneByteMax) byteSize = byteSize + 1;
				if (chr > twoByteMax) byteSize = byteSize + 1;
			}  
			return byteSize;
		},

    /**
     * this function will check whether the text is a numeric or not.
     * 
     * @param allowDot is a boolean wich specifies whether to consider
     * the '.' or not.
     *
     * @return (boolean) true if text is numeric
     */
		IsNumeric : function (text,allowDot)
		{
			if(allowDot) var ValidChars = "0123456789.";
			else var ValidChars = "0123456789";
		  
			var IsNumber=true;
			var Char;

		 
			for (i = 0; i < text.length && IsNumber == true; i++) 
			{ 
				Char = text.charAt(i); 
				if (ValidChars.indexOf(Char) == -1) 
				{
					IsNumber = false;
				}
			}
			return IsNumber;   
		},

    /**
     *
     *This function will check for a valid Phone Number
     *
     *@param (string) text The string to check
     *
     *@return (boolean) true if text is a phone number, ie if each character of
     *input is one of 0123456789() -+ 
     */
		IsValidPhone : function (text)
		{
		
			var ValidChars = "0123456789()-+ ";
		  
			var IsValid=true;
			var Char;
		 
			for (i = 0; i < text.length && IsValid == true; i++) 
			{ 
				Char = text.charAt(i); 
				if (ValidChars.indexOf(Char) == -1) 
				{
					IsValid = false;
				}
			}
			return IsValid;   
		},
		
		/**
		 *  To use confirmation popup, the ${StoreDirectory}/Common/ConfirmationPopup.jspf must be included
		 *  in the jsp page where the confirmation popup launches from.
		 *	This function launch confirmation popup
		 * 
		 * @param (string) topicName The name of the topic that calling widget subscribing to.
		 * @param (stirng) message The message to be displayed in the confirmation dialog.
		 */
		showConfirmationDialog: function(topicName, message){
			require(["dijit/registry", "dojo/dom", "dojo/on", "dojo/topic", "dojo/_base/event"], function(registry, dom, on, topic){
				dom.byId("confirmationPopupMessage").innerHTML = message;
				var confirmationPopupWidget = registry.byId('confirmationPopup');
				confirmationPopupWidget._signalYes = on(dom.byId("confirmationPopupYES"), "click", function(e){
						e.preventDefault();
						if (confirmationPopupWidget._signalYes !== undefined && confirmationPopupWidget._signalYes !== null ){
							confirmationPopupWidget._signalYes.remove();
						}
						if (confirmationPopupWidget._signalNo !== undefined && confirmationPopupWidget._signalNo !== null){
							confirmationPopupWidget._signalNo.remove();
						}
						confirmationPopupWidget.hide();
						topic.publish(topicName, {action: "YES"});
					}),
					confirmationPopupWidget._signalNo = on(dom.byId("confirmationPopupNO"), "click", function(e){
						e.preventDefault();
						if (confirmationPopupWidget._signalYes !== undefined && confirmationPopupWidget._signalYes !== null ){
							confirmationPopupWidget._signalYes.remove();
						}
						if (confirmationPopupWidget._signalNo !== undefined && confirmationPopupWidget._signalNo !== null){
							confirmationPopupWidget._signalNo.remove();
						}
						confirmationPopupWidget.hide();
						topic.publish(topicName, {action: "NO"});
					})
				confirmationPopupWidget.show();
			});
		}
	}
}
