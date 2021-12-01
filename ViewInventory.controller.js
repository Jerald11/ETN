sap.ui.define([
  "jquery.sap.global",
  "sap/ui/Device",
  "sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
	"sap/m/MessageBox",
	"sap/ui/core/Fragment",
	"sap/ui/core/Core",
  "claims/Entrego/controller/APPui5"
],function(jQuery,Device,Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment,Core,APPui5) {
  "use strict";
  var oITM;
  var todates;
  var oDelivery;
  var oDetails;
  return Controller.extend("claims.Entrego.view.ViewInventory", {
    onInit: function(){
      var that = this;
      that.oModel=new JSONModel("model/data.json");
      that.getView().setModel(this.oModel,"oModel");

      var oView = that.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().onLoadRecords();
              },
            onBeforeFirstShow: function(evt) {

                //This event is fired before the NavContainer shows this child control for the first time.
              },
            onBeforeHide: function(evt) {

            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                that.initialize();

            }
        });

        that.oModel.refresh();
      },

      initialize: function(){
        this.oModel=new JSONModel("model/data.json");
        this.getView().setModel(this.oModel,"oModel");
        // this.modelServices();
        todates = new Date();
        var dd = String(todates.getDate()).padStart(2, '0');
        var mm = String(todates.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = todates.getFullYear();

        APPui5.openLoadingFragment();
      },

      modelServices: function() {
        var self = this;
        this.intervalHandle = setInterval(function() {
          self.onLoadRecords();
         }, 3000);
        },

    onLoadRecords: function (ItemCode) {

      var sUrl = localStorage.getItem("RFID_Server") + "/getInventoryRecord";
      $.ajax({
        url: sUrl,
        type: "GET",
        async: false,
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          sap.m.MessageToast.show(Message);
        },
        success: function (json) {
          // console.log(json)
        },
        context: this
      }).done(function (results) {
        // this.getView().byId("Inventory").setVisibleRowCount(results.length);
        for(let i = 0;i < results.length;i++){
          var statebar = "Information";

          if(results[i].iStatus == "Open"){
            statebar ="Information";
          }else if(results[i].iStatus == "Ordered"){
            statebar ="Warning";
          }else if(results[i].iStatus == "Reserved"){
            statebar ="Indication02";
          }else if(results[i].iStatus == "Close"){
            statebar ="Success";
          }else{
            statebar ="Error";
          }
          try{
            this.oModel.getData().InventoryRecord.push({
              "SKU_Name": results[i].SKU_Name,
              "SKU_Code": results[i].SKU_Code,
              "SKU_Description": results[i].SKU_Description,
              "Category": results[i].Category,
              "Price": results[i].Price,
              "Quantity": results[i].Quantity,
              "UnitOfMeasure": results[i].UnitOfMeasure,
              "iMonth": results[i].iMonth,
              "iYear": results[i].iYear,
              "iFile": results[i].iFile,
              "Orderby": results[i].Orderby,
              "Date_Ordered": results[i].Date_Ordered,
              "iStatus": results[i].iStatus,
              "State": statebar,
              "Created_Date": results[i].Created_Date
            })
            } catch (e){
              console.log(e);
          }
        }
        APPui5.closeLoadingFragment();
        this.oModel.refresh();
      });
    },


    filterInquiry : function(oEvent) {
      var sQuery = oEvent.getParameter("query");
      this._oGlobalFilter = null;

      if (sQuery) {
        this._oGlobalFilter = new Filter([
          new Filter("SKU_Name", FilterOperator.Contains, sQuery),
          new Filter("SKU_Code", FilterOperator.Contains, sQuery),
          new Filter("Category", FilterOperator.Contains, sQuery),
          new Filter("iStatus", FilterOperator.Contains, sQuery)
        ], false);
      }

      this._filterH();
    },

    _filterH : function() {
      var oFilter = null;

      if (this._oGlobalFilter && this._oPriceFilter) {
        oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
      } else if (this._oGlobalFilter) {
        oFilter = this._oGlobalFilter;
      } else if (this._oPriceFilter) {
        oFilter = this._oPriceFilter;
      }

      this.byId("Inventory").getBinding().filter(oFilter, "Application");
    },

  });
});
