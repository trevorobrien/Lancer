//-----------------------------------------------------------------
// Licensed Materials - Property of IBM
//
// WebSphere Commerce
//
// (C) Copyright IBM Corp. 2008, 2011 All Rights Reserved.
//
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with
// IBM Corp.
//-----------------------------------------------------------------

/**
 * @fileOverview This class contains declarations of AJAX services used by the Madisons store pages.
 */

NewsLetterServicesDeclarationJS = {
	langId: "-1", /* language of the  store */
	storeId: "", /*numeric unique identifier of the store */
	catalogId: "", /*catalog of the store that is currently in use */
	footer: false,
	email: "",

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
	}
}


	dojo.require("wc.service.common");
	
	wc.service.declare({
		id: "AjaxSubscribeNewsletter",
		actionId: "AjaxSubscribeNewsletter",
		url: getETAbsoluteURL() + "AjaxSubscribeNewsletter",
		formId: ""

		,successHandler: function(serviceResponse) {
			if(serviceResponse.response.indexOf("success") != -1) {
				CKNewsletter._handleSuccess();
				// NBC-109  Extra UDO call on order confirm page 
				//Submit the success / failure  to tealium only if its not from Guest checkout
				if (serviceResponse.sourceCode[0] != "04")
					PVHTealium.submitNewsletterSuccess(serviceResponse);
			}
			else{
				CKNewsletter._handleFailure(serviceResponse);
				// NBC-109  Extra UDO call on order confirm page 
				//Submit the success / failure  to tealium only if tis not from Guest checkout
				
				if (serviceResponse.sourceCode[0] != "04")
					PVHTealium.submitNewsletterFailure(serviceResponse);
			}
		}

		,failureHandler: function(serviceResponse) {
			// NBC-109  Extra UDO call on order confirm page 
			// This will be invoked when ET is down or a generic error has occured.
			CKNewsletter._handleFailure(serviceResponse);
			if (PVHTealium.getNewsletterSrcCode () != null && PVHTealium.getNewsletterSrcCode () != "04")
				PVHTealium.submitNewsletterFailure(serviceResponse);
		}

	});
	
	if(typeof callNewsletter!= 'undefined' && callNewsletter){
		 var params = [];		
		 params['email'] = dojo.byId('WC_GuestUserRegForm_FormInput_email1_In_Register_1').value;
			
			if(typeof isOrderFlow!= 'undefined' && isOrderFlow){
				params['sourceCode'] = '04';
				params['firstName'] = dojo.byId('WC_GuestUserRegForm_NameEntryForm_FormInput_firstName_1').value;
				params['lastName'] = dojo.byId('WC_GuestUserRegForm_NameEntryForm_FormInput_lastName_1').value;
				params['streetAddress1'] = dojo.byId('WC_GuestUserRegForm_AddressEntryForm_FormInput_address1_1').value;
		        params['streetAddress2']= dojo.byId('WC_GuestUserRegForm_AddressEntryForm_FormInput_address2_1').value;
		        params['city'] = dojo.byId('WC_GuestUserRegForm_AddressEntryForm_FormInput_city_1').value;
		        params['country'] = dojo.byId('WC_GuestUserRegForm_AddressEntryForm_FormInput_country_1').value;
		        params['state'] = dojo.byId('WC_GuestUserRegForm_AddressEntryForm_FormInput_state_1').value;
		        params['zipCode'] = dojo.byId('WC_GuestUserRegForm_AddressEntryForm_FormInput_zipCode_1').value;
			}
			
			NewsLetterServicesDeclarationJS.email = dojo.byId('WC_GuestUserRegForm_FormInput_email1_In_Register_1').value;
			wc.service.invoke("AjaxSubscribeNewsletter", params);
	}else{
		/*if (U.isOrderConfirmationPage())
			{
				PVHTealium.submitNewsletterGstNotOpted();
			}*/
	}


/**
 * @class This class stores common parameters needed to make the service call.
 */

function getETAbsoluteURL() {
	
	if (absoluteURL != "") {
		var currentURL = document.URL;
		
		var currentProtocol = "";
	
		if (currentURL.indexOf("://") != -1) {
			currentProtocol = currentURL.substring(0, currentURL.indexOf("://"));
		}
		
		var savedProtocol = "";
		if (absoluteURL.indexOf("://") != -1) {
			savedProtocol = absoluteURL.substring(0, absoluteURL.indexOf("://"));
		}
		
		if (currentProtocol != savedProtocol) {
			absoluteURL = currentProtocol + absoluteURL.substring(absoluteURL.indexOf("://"));
		}
	}
	
	return absoluteURL;
}
