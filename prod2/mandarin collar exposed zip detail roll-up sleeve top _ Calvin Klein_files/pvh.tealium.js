var PVHTealium = PVHTealium ||
{
	submitAddToCart : function(response){
		//WI29819: CK: Bundles Product added notification only shows 1 product and Mobile bundles are missing alts
        console.log("DEBUG : submitAddToCart called response: ", response);
        var tealiumObj = {};
        tealiumObj.event_name = PVHTealium.EVENT_CART_ADD;
        tealiumObj.product_sku_number = [];
    	tealiumObj.product_sku_color = [];
    	tealiumObj.product_sku_size = [];        	
    	tealiumObj.product_base_price = [];
    	tealiumObj.product_sale_price = [];
    	tealiumObj.product_name = [];
    	tealiumObj.product_quantity = [];
    	tealiumObj.product_part_number = [];
        if(U.isBundlePage()){
            //Bundle
        	
            //catalogEntryId = response.catEntryId_1[0];
            //tealiumObj.product_quantity=response.quantity_1[0];
        	// The response for bundles comes as catentryId_1 , _2 etc. based on the number of products in the bundle
         	for (var bundlePrd = 0; bundlePrd<bundleSwatchesList.length;bundlePrd++ ){
         		var responseNumber = bundlePrd+1;
         		if (response["catEntryId_"+responseNumber] != undefined){
         			var catalogEntryId = response["catEntryId_"+responseNumber][0];
         			 tealiumObj.product_quantity.push(response["quantity_"+responseNumber][0]);
         			if (catalogEntryId != undefined){
	        			var count;
	        			// This loop is to check under which product the sku that's added to the cart belongs to.
			        	for(var i=0; i<bundleSwatchesList.length; i++){
			                	if(bundleSwatchesList[i].itemPriceInventoryJsonObject !=null
			                		&& bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId] != undefined){
			                		
			                		count = i;
			                		break;
			                	}
			        	}
			        	console.log(count);
			            var productId = bundleSwatchesList[count].productId;
	                    console.log("prdocut id =" , productId);
	                    console.log("catalogEntryId : ", catalogEntryId);
	                    console.log("bundleSwatchesList[count].itemPriceInventoryJsonObject : ", bundleSwatchesList[count].itemPriceInventoryJsonObject);
	                    console.log("bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId] : ", bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId]);
	                    
	                    tealiumObj.product_sku_number.push(bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.catalogEntryIdentifier.externalIdentifier.partNumber);
	                    
	                    tealiumObj.event_name = PVHTealium.EVENT_CART_ADD;
	                    // WI 29223 Tealium : Add to Cart Event: product_base_price is missing product_part_number needs to pass the ecom style number, it's passing the SKU Handled for QV also.
	                    if (bundleSwatchesList[count].itemPriceInventoryJsonObject != null && bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.listPrice == ""){
	                        tealiumObj.product_base_price.push(bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.offerPrice.substr(1));
	                        tealiumObj.product_sale_price.push("");
	                    }else{
	                        tealiumObj.product_base_price.push(bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.listPrice);
	                        tealiumObj.product_sale_price.push(bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.offerPrice.substr(1));
	                    }
	                    
	                    var attrs = bundleSwatchesList[count].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.catalogEntryAttributes;
	                    for (k=0;k<attrs.length;k++){
	                        if (attrs[k].identifier == "Color"){
	                            tealiumObj.product_sku_color.push(attrs[k].values[0].value);
	                        }else if (attrs[k].identifier == "Size"){
	                            tealiumObj.product_sku_size.push(attrs[k].values[0].value);
	                        }
	                    }
	                    pName = $("#product_"+productId+" .productNameInner");
	                    tealiumObj.product_name.push(pName.text());
	                    tealiumObj.product_part_number.push($("#product_"+productId+" .styleNo").text());
	                    PVHTealium.partNumber = $("#product_"+productId+" .styleNo").text();
			        	
			        	
	        		}
         		}
        	}
            /*for(var i=0; i<bundleSwatchesList.length; i++){
            		var j=i+1;
            	if (response["catEntryId_"+j] != undefined){
            		
            		 catalogEntryId = response["catEntryId_"+j][0];
            		 tealiumObj.product_quantity.push(response["quantity_"+j][0]);
	                 if(bundleSwatchesList[i].itemPriceInventoryJsonObject !=null && bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId] != undefined){
	                    
	                    var productId = bundleSwatchesList[i].productId;
	                    console.log("prdocut id =" , productId);
	                    console.log("catalogEntryId : ", catalogEntryId);
	                    console.log("bundleSwatchesList[i].itemPriceInventoryJsonObject : ", bundleSwatchesList[i].itemPriceInventoryJsonObject);
	                    console.log("bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId] : ", bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId]);
	                    
	                    tealiumObj.product_sku_number.push(bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.catalogEntryIdentifier.externalIdentifier.partNumber);
	                    
	                    tealiumObj.event_name = PVHTealium.EVENT_CART_ADD;
	                    // WI 29223 Tealium : Add to Cart Event: product_base_price is missing product_part_number needs to pass the ecom style number, it's passing the SKU Handled for QV also.
	                    if (bundleSwatchesList[i].itemPriceInventoryJsonObject != null && bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.listPrice == ""){
	                        tealiumObj.product_base_price.push(bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.offerPrice.substr(1));
	                        tealiumObj.product_sale_price.push("");
	                    }else{
	                        tealiumObj.product_base_price.push(bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.listPrice);
	                        tealiumObj.product_sale_price.push(bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.offerPrice.substr(1));
	                    }
	                    
	                    var attrs = bundleSwatchesList[i].itemPriceInventoryJsonObject[catalogEntryId].catalogEntry.catalogEntryAttributes;
	                    for (i=0;i<attrs.length;i++){
	                        if (attrs[i].identifier == "Color"){
	                            tealiumObj.product_sku_color.push(attrs[i].values[0].value);
	                        }else if (attrs[i].identifier == "Size"){
	                            tealiumObj.product_sku_size.push(attrs[i].values[0].value);
	                        }
	                    }
	                    pName = $("#product_"+productId+" .productNameInner");
	                    tealiumObj.product_name.push(pName.text());
	                    tealiumObj.product_part_number.push($("#product_"+productId+" .styleNo").text());
	                    PVHTealium.partNumber = tealiumObj.product_part_number;
	                    
	                    
	                }
            	}
            }*/
            
        }
        else{
            //PDP
            catalogEntryId = response.catEntryId[0];
            tealiumObj.product_sku_number = [categoryDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry.catalogEntryIdentifier.externalIdentifier.partNumber];
            // WI 29223 Tealium : Add to Cart Event: product_base_price is missing product_part_number needs to pass the ecom style number, it's passing the SKU Handled for QV also.
            if (categoryDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry.listPrice == ""){
                tealiumObj.product_base_price.push(categoryDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry.offerPrice.substr(1));
                tealiumObj.product_sale_price.push("");
            }else{
                tealiumObj.product_base_price.push(categoryDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry.listPrice);
                tealiumObj.product_sale_price.push(categoryDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry.offerPrice.substr(1));
            }
            
            var attrs = categoryDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry.catalogEntryAttributes;
            for (i=0;i<attrs.length;i++){
                if (attrs[i].identifier == "Color"){
                    tealiumObj.product_sku_color = [attrs[i].values[0].value];
                }else if (attrs[i].identifier == "Size"){
                    tealiumObj.product_sku_size = [attrs[i].values[0].value];
                }
                
            }
            tealiumObj.product_part_number.push($("#product").data().partNumber);
            
            PVHTealium.partNumber = $("#product").data().partNumber.toString();
            tealiumObj.product_quantity=response.quantity;
            pName = $(".productNameInner")[0];
            tealiumObj.product_name.push(pName.innerText);
        }

      
        tealiumObj.page_division=utag_data.page_division;
       
        tealiumObj.page_name=utag_data.page_name;
        tealiumObj.page_type=utag_data.page_type;
        
        PVHTealium.submitUtagLink(tealiumObj);
    },
    submitColorChange : function(response){
    	tealiumObj = {};
    	tealiumObj.event_name =PVHTealium.EVENT_CHANGE_COLOR;
    	tealiumObj.product_sku_color  = response;
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitSizeChange:function(response)
    {
    	tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_CHANGE_SIZE;
		tealiumObj.product_sku_size  = response;
		PVHTealium.submitUtagLink(tealiumObj);
    },
    submitRemoveCart:function(response)
    {
    	tealiumObj = {};
    	//WI cart_remove product_ variables are not all arrays like they are supposed to be.
    	partNumberArray =  utag_data.product_sku_number;
    	tealiumObj.product_base_price = [];
    	tealiumObj.product_sale_price = [];
    	tealiumObj.product_sku_color = [];
    	tealiumObj.product_sku_size = [];
    	tealiumObj.product_part_number = [];
    	tealiumObj.abandon_product = [];
    	tealiumObj.product_name = [];
    	tealiumObj.product_sku_number = [];
    	tealiumObj.product_quantity = [];
    	for (i=0;i<partNumberArray.length;i++)
			if (partNumberArray[i]==response){
				tealiumObj.product_base_price.push(utag_data.product_base_price[i]);
				tealiumObj.product_sale_price.push(utag_data.product_sale_price[i]);
				tealiumObj.product_sku_color.push(utag_data.product_sku_color[i]);
				tealiumObj.product_sku_size.push(utag_data.product_sku_size[i]);
				tealiumObj.product_part_number.push(utag_data.product_part_number[i]);
				tealiumObj.abandon_product.push(utag_data.product_part_number[i]);
				tealiumObj.product_quantity.push(utag_data.product_quantity[i]);
				tealiumObj.event_name = PVHTealium.EVENT_CART_REMOVE;
				tealiumObj.product_name.push(utag_data.product_name[i]);
				tealiumObj.product_sku_number.push(response);
				
			}
		PVHTealium.submitUtagLink(tealiumObj);
    },
    submitCartEmpty:function(response)
    {
    	tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_CART_EMTPY;
    	PVHTealium.submitUtagLink();
    },
    submitAjaxProductLoad:function(response)
    {
    	tealiumObj = {};
    	tealiumObj.event_name  = PVHTealium.EVENT_PRODUCT_LOAD;
		tealiumObj.browse_products = response;
		PVHTealium.submitUtagLink(tealiumObj);
    },
    
    submitFilterSort:function(response)
    {	
    	var pageRefinement=response.facets;  
    	
		if(U.isNotNull(pageRefinement) || U.isNotNull(response.$selectedSort))
		{
			//WI29333 CK : Tealium - Refinement values is separated by both pipe and ampersand symbol in category landing page
			//WI29661 THCKSP : Tealium : page_refinement event value separates are not same for all filter values
			pageRefinement=typeof pageRefinement==U.STRING ? pageRefinement.replace(/^&/,U.EMPTY).replace(/=/g,U.COLON).replace(/&/g,U.PIPE) : U.EMPTY;
			var sortRefinement=U.isNotNull(response.$selectedSort) ? response.$selectedSort.text() : U.EMPTY;
			
			tealiumObj = {};
	    	tealiumObj.event_name = PVHTealium.EVENT_FILTER_SORT;
			tealiumObj.sort_refinement = sortRefinement;
			tealiumObj.page_refinement = pageRefinement;
			tealiumObj.certona_div_id=utag_data.certona_div_id;
			tealiumObj.certona_number_rec = utag_data.certona_number_rec;
			tealiumObj.sub_section = utag_data.sub_section;
			tealiumObj.sub_subsection = utag_data.sub_subsection;
			tealiumObj.page_type = utag_data.page_type;
			tealiumObj.page_name = utag_data.page_name;
			tealiumObj.page_division = utag_data.page_division;
			tealiumObj.browse_products = utag_data.browse_products;
			tealiumObj.store_id = utag_data.store_id;
			tealiumObj.product_category_id=utag_data.product_category_id;
			tealiumObj.search_refinement=response.currentFilter;
			tealiumObj.search_refinement_value=response.currentFilterValue;
			//WI29408 Tealium : CK Loyalty preferred_account variable is missing in the pages given in Req. doc.
			if (utag_data.preferred_account != undefined )
				tealiumObj.preferred_account = utag_data.preferred_account;
			PVHTealium.submitUtagLink(tealiumObj);
		}
    },
    
    submitUserLogin:function(response)
    {
    	var tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_USER_LOGIN;
		tealiumObj.customer_birthday = response.dateOfBirth;
		tealiumObj.customer_city = response.city;
		tealiumObj.customer_country = response.country;
		tealiumObj.customer_gender = response.gender;
		tealiumObj.customer_zipcode = response.zipcode;
		tealiumObj.customer_state = response.state;
		if (response.preferred_account != undefined )
			tealiumObj.preferred_account = response.preferred_account;
		if (response.customer_home_store != undefined )
			tealiumObj.customer_home_store = response.customer_home_store;
		console.log("user login event");
		PVHTealium.submitUtagLink(tealiumObj);
    	
    },
    submitUserLogout:function(response)
    {
    	tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_USER_LOGOUT;
		// get the value from cookie USER_DETAILS
    	var cookieValue = getCookie("USER_DETAILS");
    	// WI29769 Tealium: user_logout event does not always fire
    	//console.log("state="+response.state+"zipcode = "+response.zipcode);
    	
    	tealiumObj.customer_zipcode = "";
    	tealiumObj.customer_state = "";
    	if (cookieValue!=undefined && cookieValue != null)
    	{
    		var cookieVal = JSON.parse(cookieValue);
    		tealiumObj.customer_zipcode = (cookieVal.zipCode==null) ? "" : cookieVal.zipCode;
			tealiumObj.customer_state = (cookieVal.state == null) ? "" :cookieVal.state ;
			tealiumObj.customer_email = cookieVal.customer_email;
    	}
		tealiumObj.logged_in_status = PVHTealium.NOT_LOGGED_IN;
		$.cookie("USER_DETAILS", null,{path: '/'});
		PVHTealium.submitUtagLink(tealiumObj);
    },
    submitUserRegistration:function(response)
    {
    	var tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_USER_REGISTER;
		tealiumObj.customer_birthday = response.dateOfBirth;
		tealiumObj.customer_city = response.city;
		tealiumObj.customer_country = response.country;
		tealiumObj.customer_gender = response.gender;
		tealiumObj.customer_zipcode = response.zipcode;
		tealiumObj.customer_state = response.state;
		if (response.preferred_account != undefined )
			tealiumObj.preferred_account = response.preferred_account;
		if (response.customer_home_store != undefined )
			tealiumObj.customer_home_store = response.customer_home_store;
		console.log("User registration event..");
		PVHTealium.submitUtagLink(tealiumObj);
    	
    },
    submitUtagLink:function(tealiumObj)
    {
    	U.callWhenAvailable(function()
    	{
    		return typeof utag!=U.UNDEFINED; 
    	},function()
    	{
    		utag.link(tealiumObj);
    	});
    },
    handleTealiumError:function(tealiumObj){
    	console.log("DEBUG TEALIUM : handleTealiumError() called");
    	//jira NBC-34 CK: Utag_view error messages should be changed to utag_link
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitUtagView:function (tealiumObj){
    	U.callWhenAvailable(function()
    	{
    		return typeof utag!=U.UNDEFINED; 
    	},function()
    	{
    		utag.view(tealiumObj);
    	});
    },
    submitNewsletterOpen : function(){
    	tealiumObj = {};
    	tealiumObj.page_division=PVHTealium.EMAIL_SIGNUP_OPEN_PAGENAME;
    	tealiumObj.page_name=PVHTealium.EMAIL_SIGNUP_OPEN_PAGENAME;
    	tealiumObj.page_type=PVHTealium.EMAIL_SIGNUP_OPEN_PAGENAME;
    	tealiumObj.event_name=PVHTealium.EVENT_EMAIL_POPUP_OPEN;
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitNewsletterSuccess : function(response){
    	tealiumObj = {};
    	// WI29693 SP | Mobile Footer Registration fails
    	if (response.sourceCode[0] != "04"){
	    	tealiumObj.page_division=PVHTealium.EVENT_EMAIL_SIGNUP_SUCCESS_PAGENAME;
	    	tealiumObj.page_name=PVHTealium.EVENT_EMAIL_SIGNUP_SUCCESS_PAGENAME;
	    	tealiumObj.page_type=PVHTealium.EVENT_EMAIL_SIGNUP_SUCCESS_PAGENAME;
    	}
    	tealiumObj.event_name=PVHTealium.EVNET_EMAIL_SIGNUP_SUCCESS;
    	tealiumObj.customer_email=response.email[0];
    	if (response.sourceCode[0] === "02")
    		{
    			if (!U.isMobile())
    				tealiumObj.email_location=PVHTealium.EMAIL_SIGNUP_FOOTER;
    			else
    				tealiumObj.email_location=PVHTealium.EMAIL_SIGNUP_MOBILE_FOOTER;
    		}
    	else if (response.sourceCode[0] === "01")
    	{
    		if (utag_data.page_division.indexOf("Custom") == -1)
    			tealiumObj.email_location=PVHTealium.EMAIL_SIGNUP_MODAL;
    		else
    			tealiumObj.email_location=utag_data.page_division + PVHTealium.EVENT_EMAIL_SIGNUP_SUCCESS_PAGENAME;
    	}	
    	else if (response.sourceCode[0] === "04"){
    		tealiumObj.email_location = PVHTealium.EMAIL_SIGNUP_CHECKOUT;
    	}
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitNewsletterFailure: function(response){
    	tealiumObj = {};
    	//WI28924 THSP- Attributes are not getting displayed in the page source as per the requirement document when user gives an invalid email ID in news letter signup overlay
    	// WI29863 Tealium: utag data does not fire on an unsuccessful email sign up
    	if (response.errorCode == undefined && response.errorMessage == undefined){
	    	if (response.sourceCode[0] === "01")
	    	{	if (utag_data.page_division.indexOf("Custom") == -1)
	    			tealiumObj.page_name=PVHTealium.EVENT_EMAIL_SIGNUP_FAILURE_PAGENAME;
	    		else
	    			tealiumObj.page_name=utag_data.page_division + PVHTealium.EVENT_EMAIL_SIGNUP_FAILURE_PAGENAME;
	    	} 
    	}
    	else
    		{
    			tealiumObj.page_name=PVHTealium.EVENT_EMAIL_SIGNUP_FAILURE_PAGENAME;
    		}
    	tealiumObj.page_division=PVHTealium.EMAIL_SIGNUP_OPEN_PAGENAME;
    	// WI29453 THSP- page_type and page_name values are not getting displayed as per the requirement document in page source when user gives an invalid email ID in news letter signup overlay
       	tealiumObj.page_type=PVHTealium.EMAIL_SIGNUP_OPEN_PAGENAME;
    	tealiumObj.event_name=PVHTealium.EVENT_EMAIL_SIGNUP_ERROR;
    	//WI29863 Tealium: utag data does not fire on an unsuccessful email sign up. No need of customer_email variable as per the req. doc.
    	/*if (response.email != undefined )
    		tealiumObj.customer_email=response.email[0];*/
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitNewsletterSuccessRegPopup:function(){
    	tealiumObj = {};
    	tealiumObj.page_division=PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION;
    	tealiumObj.page_name=PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION_SUCCESS;
    	tealiumObj.page_type=PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION;
    	//JIRA NBC-37 CK: Data object email_location not supposed to be on Post Purchase Registration
    	//tealiumObj.email_location =PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION;
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitNewsletterGuestRegPopup:function(){
    	tealiumObj = {};
    	tealiumObj.page_division=PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION;
    	tealiumObj.page_name=PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION;
    	tealiumObj.page_type=PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION;
    	// WI29222 - Comment #4 , issue1
    	//tealiumObj.email_location =PVHTealium.EMAIL_POST_PURCHASE_REGISTRATION;
    	tealiumObj.event_name=PVHTealium.EVENT_EMAIL_POPUP_OPEN;
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitNewsletterGstNotOpted:function(){
    	tealiumObj = {};
    	tealiumObj.customer_email = $("#emailAddress").val();
    	tealiumObj.email_location =PVHTealium.EMAIL_SIGNUP_CHECKOUT;
    	tealiumObj.event_name=PVHTealium.EMAIL_SIGNUP_OPEN_PAGENAME;
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitUserUpdate:function(response)
    {
    	
    	tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_USER_ACCOUNT_UPDATE;
    	var cookieValue = getCookie("USER_DETAILS");
		// Take the details from the cookie USER_DETAILS if its not there,reading the response from the TealiumEvent.jspf
    	if (cookieValue!=undefined && cookieValue != null)
    	{
    		var cookieVal = JSON.parse(cookieValue);
    		tealiumObj.customer_zipcode = (cookieVal.zipCode==null) ? "" : cookieVal.zipCode;
			tealiumObj.customer_state = (cookieVal.state == null) ? "" :cookieVal.state ;
			tealiumObj.customer_email = cookieVal.customer_email;
			tealiumObj.customer_city = (cookieVal.city == null) ? "" :cookieVal.city;
			tealiumObj.customer_country =(cookieVal.country == null) ? "" :cookieVal.country;
			tealiumObj.customer_gender = cookieVal.gender;
			tealiumObj.customer_birthday = cookieVal.dateOfBirth;
			
    	}else{
	    	tealiumObj.customer_birthday = response.dateOfBirth;
			tealiumObj.customer_city = response.city;
			tealiumObj.customer_country = response.country;
			tealiumObj.customer_gender = response.gender;
			tealiumObj.customer_zipcode = response.zipcode;
			tealiumObj.customer_state = response.state;
    	}
		if (response.preferred_account != undefined )
			tealiumObj.preferred_account = response.preferred_account;
		if (response.customer_home_store != undefined )
			tealiumObj.customer_home_store = response.customer_home_store;
		PVHTealium.submitUtagLink(tealiumObj);
    	
    },
    submitQuickView:function(response){
    	tealiumObj = {};
    	tealiumObj.certona_div_id = ["quickview_rr","quickview2_rr"];
    	tealiumObj.certona_event = ["quickview_rr"];
    	tealiumObj.certona_number_rec = ["4","5"];
    	tealiumObj.product_part_number = response.product_part_number;
     	tealiumObj.product_base_price = response.product_base_price;
     	tealiumObj.product_sale_price = response.product_sale_price;
    	tealiumObj.product_category_id = response.product_category_id;
    	tealiumObj.product_master_catalog_category = response.product_master_catalog_category;
    	tealiumObj.product_name = response.product_name;
    	tealiumObj.page_name_alt = response.page_name_alt;
    	tealiumObj.page_division = response.page_division;
    	tealiumObj.page_type = "Quickview";
    	tealiumObj.page_name = response.page_name + ": quick view";
    	PVHTealium.submitUtagView(tealiumObj);
    },
    submitInvalidCookie : function(tealiumObj){
    	tealiumObj = {};
    	tealiumObj.page_type = 'Checkout: Shopping Bag';
    	tealiumObj.page_name = 'Checkout: Shopping Bag';
    	tealiumObj.errorDesc = 'invalid cookie was received';
    	PVHTealium.submitUtagView(tealiumObj);
    	
    },
    submitCertona : function(){
    	tealiumObj = {}; 
    	tealiumObj.certona_div_id = ["recentmain_rr","recentmain2_rr"];
    	PVHTealium.submitUtagView(tealiumObj);
    },
    // WI29222 :  Tealium : Account Register Event: When a user reigsters for a new account where they click the check box to sign up for email it should fire a registration, email sign up, and log in event.
    submitNewsLetterSignUp:function(response){
    	var tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVNET_EMAIL_SIGNUP_SUCCESS;
    	tealiumObj.page_division = response.page_division;
    	tealiumObj.page_name = response.page_name;
    	tealiumObj.page_type = response.page_type;
    	tealiumObj.customer_email = response.email;
    	// WI29222 Tealium : Account Register Event: When a user reigsters for a new account where they click the check box to sign up for email it should fire a registration, email sign up, and log in event.
    	// For post purchase registration
		if (tealiumObj.customer_email == undefined){
	    	var logonIdCookie = "WC_LogonUserId_"+U.getStoreId();
	    	if(getCookie(logonIdCookie) != undefined && getCookie(logonIdCookie)!=null){
	    		tealiumObj.customer_email = JSON.parse(getCookie(logonIdCookie)).customer_email;
	    	}
	    }
    	tealiumObj.email_location = response.email_location;
    	console.log("Newsletter signup event..");
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    //WI29008 Tealium : Copy minicart utag data exactly from prod site.
    submitMiniCartView : function(){
    	tealiumObj = {};
    	tealiumObj.certona_event = PVHTealium.EVENT_MINICART;
    	tealiumObj.page_name = PVHTealium.MINICART_PAGE;
    	tealiumObj.page_division = PVHTealium.MINICART_PAGE;
    	tealiumObj.page_category = PVHTealium.MINICART_PAGE;
    	//WI29418 THSPCK: Stop script error message get displayed when the products are added to cart.
    	tealiumObj.product_part_number = new Array();
    	//jira NBC 33 - CK: Mini Cart passes product_part_number incorrectly in UDO
    	tealiumObj.product_part_number.push(PVHTealium.partNumber);
    	var logonIdCookie = "WC_LogonUserId_"+U.getStoreId();
    	if(getCookie(logonIdCookie) != undefined && getCookie(logonIdCookie)!=null){
    		tealiumObj.logged_in_status = JSON.parse(getCookie(logonIdCookie)).logged_in_status;
    	}else{
    		tealiumObj.logged_in_status = PVHTealium.NOT_LOGGED_IN;
    	}
    	//tealiumObj.evar36 = utag_data.logged_in_status;
    	PVHTealium.submitUtagView(tealiumObj);
    },
    // WI29311 : Tealium Events : In Checkout , the shipping method & payment method should fire utag.link call
    submitShippingMethodView : function(){
    	tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_CHECKOUT_SHIPPING;
    	tealiumObj.page_name = PVHTealium.SHIPPING_METHOD_PAGE_NAME;
    	tealiumObj.page_division = utag_data.page_division;
    	tealiumObj.page_category = utag_data.page_division;
    	tealiumObj.page_type = utag_data.page_type;
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    submitPaymentMethodView : function(){
    	tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_CHECKOUT_PAYMENT;
    	tealiumObj.page_name = PVHTealium.PAYMENT_METHOD_PAGE_NAME;
    	tealiumObj.page_division = utag_data.page_division;
    	tealiumObj.page_category = utag_data.page_division;
    	tealiumObj.page_type = utag_data.page_type;
    	PVHTealium.submitUtagLink(tealiumObj);
    },
    // WI29530 CK : customer_email, event_name, email_location variables are not populated in checkout page during guest checkout
	submitNewsletterSignupGuestCheckout:function(emailId){
			tealiumObj = {};
			tealiumObj.customer_email=emailId;
			tealiumObj.event_name=PVHTealium.EVNET_EMAIL_SIGNUP_SUCCESS;
			tealiumObj.email_location = PVHTealium.EMAIL_SIGNUP_CHECKOUT;
			PVHTealium.submitUtagLink(tealiumObj);
	},  
	//WI29789 Tealium: cart_update event not working
    submitUpdateCart: function () {
    	var tealiumObj = {};
    	tealiumObj.event_name = PVHTealium.EVENT_CART_UPDATE;
    	tealiumObj.cart_items = getCookie("WC_CartTotal_"+U.getWCOrderIdCookie());
    	PVHTealium.submitUtagLink(tealiumObj);
   },
   setNewsletterSrcCode:function(srcCode){
	   PVHTealium.newsletterSrcCode = srcCode;
   },
   getNewsletterSrcCode:function(srcCode){
	  return PVHTealium.newsletterSrcCode;
   },
	EVENT_MINICART:'addtocart_op',
    MINICART_PAGE:'Mini Cart',
    EVENT_USER_LOGOUT :"user_logout",
    EVENT_USER_LOGIN :"user_login",
    EVENT_USER_REGISTER :"user_register",
    EVENT_USER_ACCOUNT_UPDATE :"user_update",
    EVENT_FILTER_SORT:"filter_sort",
    EVENT_CART_EMTPY:"cart_empty",
    EVENT_CART_REMOVE:"cart_remove",
    EVENT_CART_ADD:"cart_add",
    EVENT_CHANGE_COLOR:"change color",
    EVENT_CHANGE_SIZE:"change size",
    EVENT_PRODUCT_LOAD:"product_load",
    EMAIL_SIGNUP_OPEN_PAGENAME : "EmailSignUp",
    EVENT_EMAIL_POPUP_OPEN:"email_pop_open",
    EVENT_EMAIL_SIGNUP_ERROR :"email_signup_error",
    EVNET_EMAIL_SIGNUP_SUCCESS : "email_signup",
    EVENT_EMAIL_SIGNUP_SUCCESS_PAGENAME:"EmailSignUp: Complete",
    EVENT_EMAIL_SIGNUP_FAILURE_PAGENAME:"EmailSignUp: Error",
    EMAIL_SIGNUP_MODAL:"Email Modal",
    EMAIL_SIGNUP_FOOTER:"Footer",
    EMAIL_SIGNUP_MOBILE_FOOTER:"Mobile Footer",
    EMAIL_SIGNUP_CHECKOUT:"Checkout OptIn",
    EMAIL_POST_PURCHASE_REGISTRATION : "Post Purchase Registration",
    EMAIL_POST_PURCHASE_REGISTRATION_SUCCESS : "Post Purchase Registration: Success",
    NOT_LOGGED_IN : 'Not Logged In',
    partNumber:[],
    EVENT_CHECKOUT_SHIPPING :'checkout_shipping',
    EVENT_CHECKOUT_PAYMENT :'checkout_payment',
    SHIPPING_METHOD_PAGE_NAME : 'Checkout: Shipping Method',
    PAYMENT_METHOD_PAGE_NAME:'Checkout: Payment',
    EVENT_CART_UPDATE : "cart_update",
    newsletterSrcCode : null

};
