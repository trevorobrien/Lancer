var PVHNewsletter = PVHNewsletter ||
{    
   updateNewsletterInput:function(){
    	$(PVHNewsletter.USERREG_CUSTOMER_KEY_SELECTOR).val('');
    	$(PVHNewsletter.CUSTOMERKEY_CHECKBOX_SELECTOR).each(function() {
    		var hiddenInputVal = $(PVHNewsletter.USERREG_CUSTOMER_KEY_SELECTOR).val();
    		if (hiddenInputVal.length > 0) {
    			hiddenInputVal = hiddenInputVal + ',';
    		}
    		hiddenInputVal = hiddenInputVal + $(this).val();
    		$(PVHNewsletter.USERREG_CUSTOMER_KEY_SELECTOR).val(hiddenInputVal);
    	});
    },
	
    USERREG_CUSTOMER_KEY_SELECTOR:'input[name=\'customerKey\']',
    CUSTOMERKEY_CHECKBOX_SELECTOR:'input[name=\'newsletterCustomerKey_checkboxes\']:checked' 
}