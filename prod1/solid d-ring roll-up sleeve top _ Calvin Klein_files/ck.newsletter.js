var CKNewsletter = CKNewsletter ||
{
	
	construct:function()
	{
		CKNewsletter.$element=U.$body.find(CKNewsletter.WRAPPER_SELECTOR);
		CKNewsletter.$success=CKNewsletter.$element.find(CKNewsletter.SUCCESS_SELECTOR);
		CKNewsletter.$newsletter=CKNewsletter.$element.find(CKNewsletter.NEWSLETTER_SELECTOR);
		CKNewsletter.$input=CKNewsletter.$element.find(CKNewsletter.INPUT_SELECTOR);
	},
	
	_open:function()
	{	
		CKNewsletter._resetOverlayForm();
		O.open({contentSelector:CKNewsletter.WRAPPER_SELECTOR});
		$.cookie(CKNewsletter.COOKIE_NAME, 'true',{path: '/', expires: CKNewsletter.COOKIE_EXPIRATION});
				
		var param = [];
		param.actionId = "EmailSignUp";
		param.storeId = U.getStoreId();
		
		widget = dijit.byId('TealiumTagging_Widget');
		if(widget) widget.refresh(param);		
		
		//WI29638 CK : Tealium - event email_pop_open not working when you click sign up for email in top left corner
		PVHTealium.submitNewsletterOpen();
	},
	
	init:function()
	{
		$(CKNewsletter.LINK_SELECTOR).click(function()
		{
			CKNewsletter.$input.val('');
			//WI29786 Tealium: Email Sign Up Pop-up has wrong data object. For CK, the link is the header and opens the overlay. So the sourceCode = 01
			CKNewsletter._sourceCode='01';
			CKNewsletter._open();
		});
	},
	
	finalize:function()
	{
		if(!U.isMobile() && !$.cookie(CKNewsletter.COOKIE_NAME)) CKNewsletter._open();
		
		if(typeof callPVHNewsletter!=U.UNDEFINED && callPVHNewsletter)
		{
			CKNewsletter._invokeService(false, $("#WC_GuestUserRegForm_FormInput_email1_In_Register_1").val(),'04');
		}
		// NBC-109  Extra UDO call on order confirm page 
		//Submit the success / failure  to tealium only if tis not from Guest checkout
		
		/*else
		{
			if (U.isOrderConfirmationPage())
				PVHTealium.submitNewsletterGstNotOpted();
		}*/
	},
	
	_resetOverlayForm:function()
	{
		CKNewsletter.$newsletter.removeClass(U.HIDDEN);
		CKNewsletter.$success.addClass(U.HIDDEN);
		CKNewsletter.$input.empty();
	},
	
	_invokeService:function(footer, emailAddress, sourceCode)
	{
		if(!CKNewsletter._isSubmitted)
		{
			if(!sourceCode)
				sourceCode = CKNewsletter.getSourceCode()
				
			
			// clear error messages
			MessageHelper.clearAllErrorMessages();
			var cmPageLevelMessage = dojo.byId('cmPageLevelMessage');
			if(cmPageLevelMessage) cmPageLevelMessage.style.display = "none";
			
			var footerErrorMessage = dojo.byId('footerPageErrorMessage');
			if(footerErrorMessage) dojo.destroy(footerErrorMessage);
			
			var footerSuccessMessage = dojo.byId('footerPageSuccessMessage');
			if(footerSuccessMessage) dojo.destroy(footerSuccessMessage);
					
			var signUpEmail = '';
			if (footer) {
				signUpEmail = dojo.byId('signUpEmailFooter').value;
				//WI29786 Tealium: Email Sign Up Pop-up has wrong data object. For footer the sourcecode = 02
				CKNewsletter._sourceCode = '02';
				
				sourceCode = CKNewsletter._sourceCode;
				
			} else {
				
				if(emailAddress) 
					signUpEmail = emailAddress;
				else
					signUpEmail = dojo.byId('signUpEmail').value;
				
			}
			
			if(!MessageHelper.isValidEmail(signUpEmail)){
				// invalid email format
				if (footer) {
					MessageHelper.formErrorHandleClient('signUpEmailFooter',MessageHelper.messages["ET_ERR_EMAIL"],false);
				} else {
					MessageHelper.formErrorHandleClient('signUpEmail',MessageHelper.messages["ET_ERR_EMAIL"],false);
				}
				return;
			} else CKNewsletter._isSubmitted=true;
			
			// setup parameters and invoke the service
			var params = [];		
			params["email"] = signUpEmail;
			params["sourceCode"] = sourceCode;
			params["storeId"] = U.getStoreId();
			if(sourceCode == '06'){
				params['firstName'] = $('#firstName').val();
				params['lastName'] = $('#lastName').val();
				params['streetAddress1'] = $('#address1').val();
		        params['streetAddress2']= $('#address2').val();
		        params['city'] = $('#city').val();
		        params['country'] = $('#country').val();
		        params['state'] = $('#state').val();
		        params['zipCode'] = $('#zipCode').val();
			
			} else if (sourceCode == '04') {
				params["firstName"] = $(CKNewsletter.FIRST_NAME_SELECTOR).val();
				params["lastName"] = $(CKNewsletter.LAST_NAME_SELECTOR).val();
				params["streetAddress1"] = $(CKNewsletter.ADDRESS_1_SELECTOR).val();
				params["streetAddress2"] = $(CKNewsletter.ADDRESS_2_SELECTOR).val();
				params["city"] = $(CKNewsletter.CITY_SELECTOR).val();
				params["state"] = $(CKNewsletter.STATE_SELECTOR).val();
				params["zipCode"] = $(CKNewsletter.ZIPCODE_SELECTOR).val();
				params["country"] = $(CKNewsletter.COUNTRY_SELECTOR).val();	
			}
			
			NewsLetterServicesDeclarationJS.footer=footer;
			NewsLetterServicesDeclarationJS.email=signUpEmail;
			PVHTealium.setNewsletterSrcCode(sourceCode);
			wc.service.invoke("AjaxSubscribeNewsletter", params);
		}
	},
	
	invokeServiceProxy:function(footer)
	{
		//WI29786 Tealium: Email Sign Up Pop-up has wrong data object
		if(footer)CKNewsletter._sourceCode = '02';
		CKNewsletter._invokeService(footer);
	},
			
	getSourceCode:function()
	{
		return CKNewsletter._sourceCode;
	},
	
	setSourceCode:function(sCode)
	{
		CKNewsletter._sourceCode = sCode;
	},
	subcribeFromSweepstakes:function(){
		var $sweepstakesForm = $('#sweepstakesForm');
		if($sweepstakesForm.length)
		{
			var emailAddress = $('#emailAddress1').val();
			$('#signUpEmail').val(emailAddress);
			CKNewsletter.setSourceCode(sourceSweepstakes);
			CKNewsletter.invokeServiceProxy(false);
		}
	},
	subscribeUsingSourceCode:function(sourceCode){
		CKNewsletter.setSourceCode(sourceCode);
		CKNewsletter.invokeServiceProxy(false);
	},
	_handleSuccess:function()
	{
		//utag.link({page_type:"newsletter sign-up",page_name:"newsletter sign-up",email:NewsLetterServicesDeclarationJS.email,footer_sign_up:NewsLetterServicesDeclarationJS.footer});		
		if (NewsLetterServicesDeclarationJS.footer) {
			dojo.place("<div id='footerPageSuccessMessage' class='footerPageSuccessMessage'>"+ MessageHelper.messages["ET_SUCCESS_MESSAGE_FOOTER"] + "</div>",'signUpEmailFooter', 'before');
		} else {
			CKNewsletter.$newsletter.addClass(U.HIDDEN);
			CKNewsletter.$success.removeClass(U.HIDDEN);
			
			if(O.isOpen(CKNewsletter.WRAPPER_SELECTOR)) {
				var timeout_id= setTimeout(function(){
					O.close();
					U.enableScrolling();
				},6000);
			}
			
		}
		if(CKNewsletter.getSourceCode() == '06')
			$('#sweepstakesForm').submit();
		
		CKNewsletter._isSubmitted=false;
	},
	
	_handleFailure:function(serviceResponse)
	{
		CKNewsletter._isSubmitted=false;
		
		//utag.link({page_type:"newsletter sign-up error",page_name:"newsletter sign-up error",email:NewsLetterServicesDeclarationJS.email,footer_sign_up:NewsLetterServicesDeclarationJS.footer});
		if(!serviceResponse.errorMessage)
			serviceResponse.errorMessage = serviceResponse.response;
		if (serviceResponse.errorMessage || serviceResponse.errorMessageKey) {
			if (NewsLetterServicesDeclarationJS.footer) {
				dojo.place("<div id='footerPageErrorMessage' class='footerPageErrorMessage'> The E-mail Address is invalid  </div>",'signUpEmailFooter', 'before');
			} else {
				var element = dojo.byId('cmPageLevelMessage');
				if(element) {
					element.innerHTML = '<b>Error: The E- mail Address is invalid</b>';
					dojo.addClass(element.id, 'pageErrorMessage');
					element.style.display = "block";
				}
			}
		}
		if(CKNewsletter.getSourceCode() == '06')
			$('#sweepstakesForm').submit();
	},
	
	WRAPPER_SELECTOR:'.cmUnderlayWrapper',
	SUCCESS_SELECTOR:'#ckEmailCaptureContainerSuccess',
	NEWSLETTER_SELECTOR:'#ckEmailCaptureContainer',
	INPUT_SELECTOR:'#signUpEmail',
	LINK_SELECTOR:'#newsletterSignup',
	$element:null,
    $input:null,
    $success:null,
    //WI29786 Tealium: Email Sign Up Pop-up has wrong data object. On page load for the overlay, the sourcecode should be 01
    _sourceCode:'01',
	_isSubmitted:false,
	COOKIE_NAME:'CK_newsletter',
	COOKIE_EXPIRATION:30,
    FIRST_NAME_SELECTOR:'#WC_GuestUserRegForm_NameEntryForm_FormInput_firstName_1',
    LAST_NAME_SELECTOR:'#WC_GuestUserRegForm_NameEntryForm_FormInput_lastName_1',
    ADDRESS_1_SELECTOR:'#WC_GuestUserRegForm_AddressEntryForm_FormInput_address1_1',
    ADDRESS_2_SELECTOR:'#WC_GuestUserRegForm_AddressEntryForm_FormInput_address2_1',
    CITY_SELECTOR:'#WC_GuestUserRegForm_AddressEntryForm_FormInput_city_1',
    COUNTRY_SELECTOR:'#WC_GuestUserRegForm_AddressEntryForm_FormInput_country_1',
    STATE_SELECTOR:'#WC_GuestUserRegForm_AddressEntryForm_FormInput_state_1',
    ZIPCODE_SELECTOR:'#WC_GuestUserRegForm_AddressEntryForm_FormInput_zipCode_1'
}

var invokeServiceProxy=function(footer,sourceCode)
{
	CKNewsletter.setSourceCode(sourceCode);
	CKNewsletter.invokeServiceProxy(footer);
}
var invokeService=function(footer)
{
	CKNewsletter._invokeService(footer);
}

$(CKNewsletter._init);
