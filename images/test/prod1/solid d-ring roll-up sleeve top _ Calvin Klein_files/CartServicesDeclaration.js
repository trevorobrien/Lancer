/**
 * @fileOverview This file contains custom PVH declarations of AJAX services
 *               used by all three stores.
 */

dojo.require("wc.service.common");

/**
 * @class This class stores common parameters needed to make the service call.
 */
CartServicesDeclarationJS = {

}

/**
 * Declares an AJAX service that prepares order information before submitting
 * the order.
 */
wc.service.declare({
	id : "AjaxPrepareOrderForPayPal",
	actionId : "AjaxPrepareOrderForPayPal",
	url : "AjaxOrderProcessServiceOrderPrepare",
	formId : ""

	/**
	 * Submits the order with the name of the payment form.
	 * 
	 * @param (object) serviceResponse The service response object, which is the JSON
	 * object returned by the service invocation.
	 */
	,
	successHandler : function(serviceResponse) {
		cursor_clear();

		var paypalPiId = "";
		if (dojo.byId('paypalPiId'))
			paypalPiId = dojo.byId('paypalPiId').value;

		var params = [];
		params["storeId"] = U.getStoreId();
		params["catalogId"] = U.getCatalogId();
		params["langId"] = U.getLangId();
		params["orderId"] = serviceResponse.orderId;
		params["requesttype"] = 'ajax';

		if (paypalPiId != "") {

			var paymentInstructionsArray = paypalPiId.split(",");
			params["piId"] = paymentInstructionsArray;

			params["orderTotal"] = orderTotalVal;

			wc.service.invoke("AjaxRemovePayPalPI", params);

		} else {

			params["piAmount"] = orderTotalVal;
			params["payMethodId"] = 'PayPal';
			params["fromCart"] = 'true';
			params["URL"] = '/';

			wc.service.invoke("AjaxPIAddForPayPal", params);
		}

	}

	/**
	 * Validates that the service parameters are correct.
	 * 
	 * @param (object) parameters
	 */
	,
	validateParameters : function(parameters) {

		orderTotalVal = parameters["orderTotal"];
		return true;
	}

	/**
	 * Displays the error message returned with the service response and hides
	 * the progress bar.
	 * 
	 * @param (object) serviceResponse The service response object, which is the JSON
	 * object returned by the service invocation.
	 */
	,
	failureHandler : function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} else {
			if (serviceResponse.errorMessageKey) {
				MessageHelper
						.displayErrorMessage(serviceResponse.errorMessageKey);
			}
		}
		cursor_clear();
	}

}),

/**
 * Declares an AJAX service that adds a payment instruction to the current
 * order.
 */
wc.service.declare({
	id : "AjaxPIAddForPayPal",
	actionId : "AjaxPIAddForPayPal",
	url : "AjaxPIAdd",
	formId : ""

	/**
	 * Resets the array object that contains payment objects to add. Verifies if
	 * there is any payment instruction that needs to be updated. If there is no
	 * payment instruction that needs to be updated, direct the browser to the
	 * order summary page.
	 * 
	 * @param (object) serviceResponse The service response object, which is the JSON
	 * object returned by the service invocation.
	 */
	,
	successHandler : function(serviceResponse) {
		cursor_clear();
		var form = document.forms['punchout_paypal_cart_form'];
		form.piId.value = serviceResponse.piId;
		form.submit();
	}

	/**
	 * Resets the array object that contains existing payment objects to add.
	 * Displays the error message returned with the service response and hides
	 * the progress bar.
	 * 
	 * @param (object) serviceResponse The service response object, which is the JSON
	 * object returned by the service invocation.
	 */
	,
	failureHandler : function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} else {
			if (serviceResponse.errorMessageKey) {
				MessageHelper
						.displayErrorMessage(serviceResponse.errorMessageKey);
			}
		}
		cursor_clear();
	}

}),

/**
 * Declares an AJAX service that removes a payment instruction to the current
 * order.
 */
wc.service.declare({
	id : "AjaxRemovePayPalPI",
	actionId : "AjaxRemovePayPalPI",
	url : "AjaxOrderChangeServicePIDelete",
	formId : ""

	/**
	 * Submits the order with the name of the payment form.
	 * 
	 * @param (object) serviceResponse The service response object, which is the JSON
	 * object returned by the service invocation.
	 */
	,
	successHandler : function(serviceResponse) {
		cursor_clear();

		var params = [];
		params["storeId"] = U.getStoreId();
		params["catalogId"] = U.getCatalogId();
		params["langId"] = U.getLangId();

		params["piAmount"] = orderTotalVal;
		params["payMethodId"] = 'PayPal';
		params["requesttype"] = 'ajax';
		params["orderId"] = serviceResponse.orderId;
		params["fromCart"] = 'true';
		params["URL"] = '/';

		wc.service.invoke("AjaxPIAddForPayPal", params);

	}

	/**
	 * Validates that the service parameters are correct.
	 * 
	 * @param (object) parameters
	 */
	,
	validateParameters : function(parameters) {

		orderTotalVal = parameters["orderTotal"];
		return true;
	}

	/**
	 * Displays the error message returned with the service response and hides
	 * the progress bar.
	 * 
	 * @param (object) serviceResponse The service response object, which is the JSON
	 * 	object returned by the service invocation.
	 */
	,
	failureHandler : function(serviceResponse) {
		if (serviceResponse.errorMessage) {
			MessageHelper.displayErrorMessage(serviceResponse.errorMessage);
		} else {
			if (serviceResponse.errorMessageKey) {
				MessageHelper
						.displayErrorMessage(serviceResponse.errorMessageKey);
			}
		}
		cursor_clear();
	}

});