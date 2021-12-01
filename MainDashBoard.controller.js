sap.ui.define([
  	"claims/Entrego/controller/BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/Core",
	"claims/Entrego/controller/APPui5"
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment,Core,APPui5) {
  "use strict";
  var todates;
  var oDelivery;
  var oDetails;
  return Controller.extend("claims.Entrego.view.MainDashBoard", {
	onInit: function(){
		var that = this;
		// that.initializekey();
		var oView = that.getView();
		  oView.addEventDelegate({
			  onAfterHide: function(evt) {
				  //This event is fired every time when the NavContainer has made this child control invisible.
			  },
			  onAfterShow: function(evt) {
				  //This event is fired every time when the NavContainer has made this child control visible.
				  // oView.getController().onLoadApprovalStagesRecords();
				},
			  onBeforeFirstShow: function(evt) {

				  //This event is fired before the NavContainer shows this child control for the first time.
				},
			  onBeforeHide: function(evt) {

			  },
			  onBeforeShow: function(evt) {
				  //This event is fired every time before the NavContainer shows this child control.
				  // that.initialize();

			  }
		  });
		},

	initialize: function(){

		},






  });
});
