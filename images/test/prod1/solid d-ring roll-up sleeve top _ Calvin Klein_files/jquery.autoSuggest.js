(function($)
{
	$.fn.autoSuggest=function($searchFormParent,exclusionFunction)
	{
		var $autoSuggest=this;
		var _$searchInput, _$searchLink, _$simpleSearchForm_SearchTerm, _$autoSuggest_wrapper, _$autoSuggestDynamic_Result_div, _$autoSuggest_content_div, autoSuggestURL;
		
		var construct=function()
	    {
			_$autoSuggest_wrapper=$autoSuggest.children(".autoSuggest_wrapper");
			_$autoSuggest_content_div=_$autoSuggest_wrapper.children('#AutoSuggestDiv');
			_$autoSuggestDynamic_Result_div=_$autoSuggest_content_div.find('#autoSuggestDynamic_Result_div');
			_$searchInput=$searchFormParent.find('#SimpleSearchForm_SearchTerm');
			_$searchLink=$searchFormParent.parent().find('.searchLink');
			autoSuggestURL=U.getStorePath()+'SearchComponentAutoSuggestView';
	    }
		
		var init=function()
		{
			$autoSuggest.find('#searchRButton').click(_formSubmit);
			
			if(U.isTouch())
			{
				_$searchLink.click(_formSubmit);
				
				_$searchInput.blur(function()
				{
					if(!U.isMouseOver($autoSuggest)) //If mouse is not over, blur didn't come from tapping an auto suggest link, so close it.
					{
						close(); //If the page didn't refresh after the blur event, close auto suggest
						if(U.hasFocus(_$searchInput)) _$searchInput.blur(); //Even though a blur event was just called, check/clear focus to close the keyboard
						_$searchInput.trigger(U.SEARCH_INPUT_BLUR);
					}
				});
			} else
			{
				_$searchLink.click(_formSubmit);
				
				_$searchInput.blur(function()
				{
					if(U.isMouseOver(_$searchLink)) return false;
					else if(U.isMouseOver($autoSuggest))
					{
						U.callAfterCallStack(function()
						{
							_$searchInput.focus();
						});
						return false;
					} else
					{
						close();
						_$searchInput.trigger(U.SEARCH_INPUT_BLUR);
					}
				});
			}
			
			_$searchInput.on(U.FOCUS,_showAutoSuggestIfResults);
			
			//This is for mouse over on Search Suggestions dropbox
			$autoSuggest.on(
			{
				mouseenter: function ()
				{
					var $this=$(this);
					
					//remove prev selected item if one was selected with up/down arrow
					var $SearchSuggestions = _$autoSuggest_content_div.find('.searchDDItem');
					$SearchSuggestions.eq(autoSelectOption).removeClass('selectedDDItem');

					//add highlight to mouse hovered item
					$this.addClass('selectedDDItem');

					if (!$this.hasClass('category')) //do not populate search input with value when category
					{
						var $selectedItem = _$autoSuggest_content_div.find('.selectedDDItem a');
						_$searchInput.val( $.trim($selectedItem.attr('title')) );
					}

					var els = $autoSuggest.find('.searchDDItem'),
						currentElId = $this.attr('id'),
						index=-1;
					$.each(els, function(idx)
					{
						var _$this=$(this);
						if(_$this.attr('id')!=undefined && _$this.attr('id')==currentElId ) index = idx;
					});
					autoSelectOption = index;
				},
				mouseleave: function ()
				{
					$(this).removeClass('selectedDDItem');
				}
			},'.searchDDItem');

			_$searchInput.on('keyup',_ajaxSearchSuggestions);
			
			_$autoSuggest_wrapper.mouseenter(function()
			{
				$(this).addClass("mouseIsOver");
			}).mouseleave(function()
			{
				$(this).removeClass("mouseIsOver");
			});
			
			_$searchInput.on( 'keypress', function (event)
			{
				if(event.keyCode==13)
				{
					if(!_formSubmit()) return false;
				}
			});
			
			_$autoSuggestDynamic_Result_div.on(U.CLICK,'.autoSuggestLink',function()
			{
				selectAutoSuggest(this.title);
				return false;
			});
		}
		
		var close=function()
		{
			_showAutoSuggest(false);
		}
		
		var _formSubmit=function()
		{
			return U.submitSearchForm(_$searchInput,$searchFormParent.find('#CatalogSearchForm'));
		}
		
		var _formSubmitFromSuggestion=function()
		{
			var suggestion=$.trim(_$autoSuggest_content_div.find('.selectedDDItem a').attr('title'));
			
			if(suggestion.length)
			{
				_$searchInput.val(suggestion);
				return _formSubmit();
			} else return false;
		}
		
		var _showAutoSuggestIfResults=function()
		{
			if(_$searchInput.val().length <= AUTOSUGGEST_THRESHOLD) close();
			else _showAutoSuggest(true);
		}
		
		var _showAutoSuggest=function(display)
		{
			var hasResults=$autoSuggest.find('.searchDDItem').length;
			if(display && hasResults) $autoSuggest.show();
			else $autoSuggest.hide();
		}
		
		var selectAutoSuggest=function(term)
		{
			var searchBox = _$searchInput.val(term);
			autoSuggestPreviousTerm = term;
			_formSubmitFromSuggestion();
		}
		
		var _clearAutoSuggestResults=function()
		{
			// clear the static search results.
			for (var i = 0; i < staticContent.length; i++)
			{
				$autoSuggest.find('#'+staticContentSectionDiv[i]).empty();
			}
			
			autoSuggestPreviousTerm = "";
			autoSuggestURL = "";
			
			// clear the dynamic search results;
			_$autoSuggestDynamic_Result_div.empty();
			close();
		}
		
		var _generateStaticCategoryList=function(searchTerm)
		{
			var resultList = ["", "", "", "", "", ""],
				emptyCell = 0,
				searchTermLower = searchTerm.toLowerCase(),
				listCount = CACHED_AUTOSUGGEST_OFFSET;
			
			for(var i = 0; i < staticContent.length; i++) {
				var count = 0;
				for(var j = 0; j < staticContent[i].length; j++) {
					if (U.isFeatureEnabled(U.CATEGORY_SHORTDESC_ASUGGEST)){
						var displayNameIndex = 3;
					}
					else{
						var displayNameIndex = 2;
					}
					var searchName = staticContent[i][j][0],
						searchURL = staticContent[i][j][1],
						classDisplayName = staticContent[i][j][2],
						displayName = staticContent[i][j][displayNameIndex],
						index = searchName.toLowerCase().indexOf(searchTermLower);
					
					//25418: Replace first GREATER_THAN with space, then the remaining with dash, so sub-categories get a difference class
					var _className=$('<div>').html(classDisplayName).text().replace(' + ',U.EMPTY).replace(/[\+\s&']/g,U.EMPTY).replace(new RegExp(U.GREATER_THAN),U.SPACE+U.UNDERSCORE).replace(new RegExp(U.GREATER_THAN,'g'),U.DASH).toLowerCase();
					
					if(index !== -1 && ((exclusionFunction instanceof Function)!=true || exclusionFunction(displayName)!=true))
					{
						var displayIndex = index + displayName.length - searchName.length;
						resultList[i] = resultList[i] + "<li id='suggestionItem_" + listCount + "' role='listitem' class='searchDDItem "+staticContentHeaders[i].toLowerCase()+" _"+_className+"' tabindex='-1'><a id='autoSelectOption_" + listCount + "' title='" + displayName + "' onmouseout='this.className=\"\"; autoSuggestURL=\"\";' onmouseover='autoSuggestURL=this.href;' href=\"" + searchURL + "\">" + displayName.substr(0, displayIndex) + "<strong>" + displayName.substr(displayIndex, searchTerm.length) + "</strong>" + displayName.substr(displayIndex + searchTerm.length) + "</a></li>";
						count++;
						listCount++;
						if(count >= TOTAL_SUGGESTED) {
							break;
						}
					}
				}
			}

			for (var i = 0; i < staticContent.length; i++) {
				$autoSuggest.find('#'+staticContentSectionDiv[i]).empty();
				if(resultList[i] !== "") {
					$autoSuggest.find('#'+staticContentSectionDiv[emptyCell]).html("<div class='results "+staticContentHeaders[i].toLowerCase()+"'><div class='heading'>" + staticContentHeaders[i] + "</div><ul>" + resultList[i] + "</ul></div>");
					emptyCell++;
				}
			}
			
			return [emptyCell, listCount];
		}
		
		var _doDynamicAutoSuggest=function(url, searchTerm, showHeader)
		{
			if(autoSuggestTimer !== -1)
			{
				clearTimeout(autoSuggestTimer);
				autoSuggestTimer = -1;
			}
			
			autoSuggestTimer = U.callAfterDelay(function()
			{
				U.get(url,{term:searchTerm,showHeader:showHeader},function(data)
				{
					if($.trim(_$searchInput.val())==searchTerm)
					{
						_$autoSuggest_content_div=_$autoSuggest_wrapper.children('#AutoSuggestDiv');
						_$autoSuggestDynamic_Result_div=_$autoSuggest_content_div.find('#autoSuggestDynamic_Result_div');
						
						if(data.indexOf('ProhibitedCharacterError')==-1) _$autoSuggestDynamic_Result_div.html(data);
						else _$autoSuggestDynamic_Result_div.empty();
						
						_showAutoSuggest(true);
					}
		    	},function()
		    	{
		    		console.log("Error in Ajax SearchRequest.");
				});
			},autoSuggestKeystrokeDelay);
		}
		
		var _doAutoSuggest=function(event)
		{
			var searchTerm = $.trim(_$searchInput.val()),
				url = autoSuggestURL;

			if(searchTerm.length <= AUTOSUGGEST_THRESHOLD ) {
				close();
			}

			if(event.which === 13) {
				return;
			}

			if (event.which === 27) {
				close();
				return;
			}

			if(event.which === 38 || event.which === 40) {
				var $searchTermInput = _$searchInput,
					$SearchSuggestions = _$autoSuggest_content_div.find('.searchDDItem'),
					numSuggestions = $SearchSuggestions.length;

				if (autoSelectOption === -1 && event.which === 40) {
					var $newSelection = $SearchSuggestions.eq(0).addClass('selectedDDItem');
					if ( ! $newSelection.is('.category') ) { //do not populate search input with value when category
						var $selectedItem = _$autoSuggest_content_div.find('.selectedDDItem a');
						$searchTermInput.val( $.trim($selectedItem.attr('title')) );
					}
					autoSelectOption = 0;
				}
				else if (autoSelectOption === 0 && event.which === 38) { //UP ARROW
					$SearchSuggestions.eq(0).removeClass('selectedDDItem');
					$searchTermInput.focus();
					autoSelectOption = -1;
				}
				else if ( event.which === 38 ) { //UP ARROW
					$SearchSuggestions.eq(autoSelectOption).removeClass('selectedDDItem');
					--autoSelectOption;
					var $newSelection = $SearchSuggestions.eq(autoSelectOption).addClass('selectedDDItem');
					if ( ! $newSelection.is('.category') ) { //do not populate search input with value when category
						var $selectedItem = _$autoSuggest_content_div.find('.selectedDDItem a');
						$searchTermInput.val( $.trim($selectedItem.attr('title')) );
					}
				}
				else if ( numSuggestions-1 === autoSelectOption && event.which === 40 ) { //DOWN ARROW
					return;
				}
				else if ( event.which === 40 ) { //DOWN ARROW
					$SearchSuggestions.eq(autoSelectOption).removeClass('selectedDDItem');
					++autoSelectOption;
					var $newSelection = $SearchSuggestions.eq(autoSelectOption).addClass('selectedDDItem');
					if ( ! $newSelection.is('.category') ) { //do not populate search input with value when category
						var $selectedItem = _$autoSuggest_content_div.find('.selectedDDItem a');
						$searchTermInput.val( $.trim($selectedItem.attr('title')) );
					}
				}

				return;
			}

			if(searchTerm.length > AUTOSUGGEST_THRESHOLD && searchTerm === autoSuggestPreviousTerm) {
				return;
			}
			else {
				autoSuggestPreviousTerm = searchTerm;
			}

			if(searchTerm.length <= AUTOSUGGEST_THRESHOLD) {
				return;
			};

			// cancel the dynamic search if one is pending
			if(autoSuggestTimer !== -1) {
				clearTimeout(autoSuggestTimer);
				autoSuggestTimer = -1;
			}

			if(searchTerm.length)
			{
				autoSelectOption = -1;
				var emptyCell, listCount;
				var arr = _generateStaticCategoryList(searchTerm);
				emptyCell = arr[0];
				listCount = arr[1];
				
				if(searchTerm.length > DYNAMIC_AUTOSUGGEST_THRESHOLD)
				{
					var showHeader = true;
					_doDynamicAutoSuggest(url, searchTerm, showHeader);
				} else _$autoSuggestDynamic_Result_div.empty();
			} else _clearAutoSuggestResults();
		}
		
		var _ajaxSearchSuggestions=function(event)
		{
			_doAutoSuggest(event);
		}
		
		/**
		 * This variable controls the timer handler before triggering the autoSuggest.  If the user types fast, intermittent requests will be cancelled.
		 * The value is initialized to -1.
		 */
		autoSuggestTimer = -1;

		/**
		 * This variable controls the delay of the timer in milliseconds between the keystrokes before firing the search request.
		 * The value is initialized to 250.
		 */
		autoSuggestKeystrokeDelay = 250;

		/**
		 * This variable stores the old search term used in the auto suggest search box
		 * The value is initialized to empty string.
		 */
		autoSuggestPreviousTerm = "";

		/**
		 * This variable stores the URL of currently selected static autosuggest recommendation
		 * The value is initialized to empty string.
		 */
		autoSuggestURL = "";

		/**
		 * This variable stores the index of the selected auto suggestion item when using up/down arrow keys.
		 * The value is initialized to -1.
		 */
		autoSelectOption = -1;

		/**
		 * This variable stores the index offset of the first previous history term
		 * The value is initialized to -1.
		 */
		historyIndex = -1;

		/**
		 * This variable indicates whether a the cached suggestions have been retrieved.
		 * The value is initialized to false.
		 */
		retrievedCachedSuggestions = false;

		/**
		 * This variable sets the total number of static autosuggest recommendations used for each static category/grouping.
		 * The value is initialized to 4.
		 */
		TOTAL_SUGGESTED = 10;

		/**
		 * This variable sets the total number of previous search history terms.
		 * The value is initialized to 2.
		 */
		TOTAL_HISTORY = 2;

		/**
		 * This variable controls when to trigger the auto suggest box.  The number of characters greater than this threshold will trigger the auto suggest functionality.
		 * The static/cached auto suggest will be performed if this threshold is exceeded.
		 * The value is initialized to 1.
		 */
		AUTOSUGGEST_THRESHOLD = 1;

		/**
		 * This variable controls when to trigger the dynamic auto suggest.  The number of characters greater than this threshold will trigger the request for keyword search.
		 * The static/cached auto suggest will be be displayed if the characters exceed the above config parameter, but exceeding this threshold will additionally perform the dynamic search to add to the results in the static/cached results.
		 * This value should be greater or equal than the AUTOSUGGEST_THRESHOLD, as the dynamic autosuggest is secondary to the static/cached auto suggest.
		 * The value is initialized to 1.
		 */
		DYNAMIC_AUTOSUGGEST_THRESHOLD = 1;

		/**
		 * This variable is an internal constant used in the element ID's generated in the autosuggest content.
		 * The value is initialized to 1000.
		 */
		CACHED_AUTOSUGGEST_OFFSET = 1000;
		
		construct();
		init();
	}
})(jQuery);
