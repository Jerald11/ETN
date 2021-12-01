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
  "claims/Entrego/controller/APPui5",
  "sap/ui/export/Spreadsheet",
  'sap/ui/export/library'
], function(Controller,MessageToast, JSONModel, Filter, FilterOperator, Token, MessageBox,Fragment,Core,APPui5,Spreadsheet,exportLibrary) {
  "use strict";
  var todates;
  var oDelivery;
  var oDetails;
  var ImportData = [];
  var EdmType = exportLibrary.EdmType;
  return Controller.extend("claims.Entrego.view.Main", {
    onInit: function(){
      var that = this;
      that.oModel=new JSONModel("model/data.json");
      that.oModel.setSizeLimit(100000);
      that.getView().setModel(this.oModel,"oModel");
      that.getView().byId("ShelluserName").setText(localStorage.getItem("RFIDuserName"));
      that.onDashBoard();


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
            that.initialize();

          }
        });
      },

    initialize: function(){
      todates = new Date();
     
      
      },

     

      
    onDashBoard: function(){
      this.router = this.getOwnerComponent().getRouter();
      this.router.navTo("MainDashBoard");
    },

    onLogout: function(){
        var that = this;
        MessageBox.information("Are you sure you want to logout??", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        title: "",
        icon: MessageBox.Icon.QUESTION,
        styleClass:"sapUiSizeCompact",
        onClose: function (sButton) {
          if(sButton === "YES"){
          that.router = that.getOwnerComponent().getRouter();
          that.router.navTo("Routelogin");
          }
        }

        });
      },

      onRootItemSelect: function(oEvent) {
        var oMenuGroup = oEvent.getSource();

        if (oMenuGroup.getExpanded()) {
        oMenuGroup.collapse();
        } else {
        oMenuGroup.expand();
        }
      },

      onViewInventory: function(){
        this.router = this.getOwnerComponent().getRouter();
        this.router.navTo("ViewInventory");
        this.onMenuButtonPress()
      },

      onPressUpload: function(){
        if (!this.UploadForm) {
          this.UploadForm = sap.ui.xmlfragment("claims.Entrego.view.fragment.UploadInventory", this);
          this.getView().addDependent(this.UploadForm);
        }
        this.UploadForm.open();
        sap.ui.getCore().byId("idfileUploader").setValue("");
      },

      onCancelUpload: function(){
        if(this.UploadForm){
          this.UploadForm.close();
        }
      },

      onMenuButtonPress: function () {
        var toolPage = this.byId("toolPage");
        toolPage.setSideExpanded(!toolPage.getSideExpanded());
      },



      onUpload: function(e) {
        APPui5.openLoadingFragment();
        var mm = String(todates.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = todates.getFullYear();

        ImportData = [];
        var fU =  sap.ui.getCore().byId("idfileUploader");
        var domRef = fU.getFocusDomRef();
        var file = domRef.files[0];
        var reader = new FileReader();
        var that = this;
        reader.onload = function(oEvent) {
          var strCSV = oEvent.target.result;
      
          // var arrCSV = strCSV.match(/[\w .]+(?=,?)/g);
          
          var arr = [];
          var toFunction = APPui5.CSVToArray(strCSV);
          var result = Object.values(toFunction);
          for(let i = 1;i < result.length;i++){
            if(result[i].length == 6){
              var itemName = "ENT-" + result[i][0];
              var oPrice = result[i][3];
              var oDescr = result[i][1];
              oPrice = oPrice.replace(",","");
              var iPrice = (Math.round(oPrice)).toFixed(2);
              var iDescr = oDescr.replace(/[^a-zA-Z ]/g, " ");
              var fDescr = iDescr.substring(0, 190);
              arr.push({
                "SKU_Name": itemName,
                "SKU_Code":  result[i][0],
                "SKU_Description": fDescr,
                "Category": result[i][2],
                "Price": iPrice,
                "Quantity": result[i][4],
                "UnitOfMeasure": result[i][5],
                "iMonth": mm,
                "iYear": yyyy
                })
              }
            }
          console.log(arr)
          arr = JSON.stringify(arr);       
          $.ajax({
            url: localStorage.getItem("RFID_Server")  + "/AddInventory",
            type: "POST",
            data: arr,
            headers: {
              'Content-Type': 'application/json'},
            crossDomain: true,
            error: function (xhr, status, error) {
              APPui5.closeLoadingFragment();
            },
            success: function (json) { 
              APPui5.closeLoadingFragment();
           
            },context: this
          });

          // that.oModel.getData().UploadData = data;
        };
        APPui5.closeLoadingFragment();
        reader.readAsBinaryString(file);
        this.onCancelUpload();
      },

      onInsertData: function(SKU_Name,SKU_Code,SKU_Description,Category,Price,Quantity,UnitOfMeasure,iMonth,iYear){
        try{
        var that = this;
        var sUrl = localStorage.getItem("RFID_Server") + "/AddInventory?SKU_Name=" + SKU_Name + "&SKU_Code=" + SKU_Code + "&SKU_Description=" + SKU_Description + "&Category=" + Category + "&Price=" + Price + "&Quantity=" + Quantity + "&UnitOfMeasure=" + UnitOfMeasure + "&iMonth=" + iMonth + "&iYear=" + iYear;
          var settings = {
            "url": sUrl,
            "method": "POST",
            "timeout": 0,
          };
          $.ajax(settings).done(function (response) {

          });
          that.onViewInventory();
        }catch (e){
          console.log(e);
        }
      },
  });
});
