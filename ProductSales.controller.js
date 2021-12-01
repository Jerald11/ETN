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
  var oTRX;
  var myCount = 0;
  var discount = 0;
  var myAmount = 0;
  return Controller.extend("claims.Entrego.view.ProductSales", {
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
                oView.getController().onGetCartDetails();
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

        todates = new Date();
        var dd = String(todates.getDate()).padStart(2, '0');
        var mm = String(todates.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = todates.getFullYear();

        APPui5.openLoadingFragment();
        this.getView().byId("amountid").setText("P" + myAmount);
      },

    onLoadRecords: function (ItemCode) {
      var that = this;
      var sUrl = localStorage.getItem("RFID_Server") + "/getRecordbyStatus?Status=Open";

      $.ajax({
        url: sUrl,
        type: "GET",
        async: false,
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          sap.m.MessageToast.show(Message);
        },
        success: function (json) {

        },
        context: this
      }).done(function (results) {
      // that.getView().byId("Inventory").setVisibleRowCount(results.length);

        for(let i = 0;i < results.length;i++){
          var statebar = "Information";

          if(results[i].iStatus == "Open"){
            statebar ="Information";
          }else if(results[i].iStatus == "Ordered"){
            statebar ="Warning";
          }else if(results[i].iStatus == "Close"){
            statebar ="Success";
          }else{
            statebar ="Error";
          }
          try{
            this.oModel.getData().InventoryRecord.push({
              "id": results[i].id,
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
        that.oModel.refresh();
        APPui5.closeLoadingFragment();
      });
    },

    onGetCartDetails: function(){
      var that = this;     
      var sUrl = localStorage.getItem("RFID_Server") + "/getCartDetails?UserID=" + localStorage.getItem("RFIDuserName");
     
        $.ajax({
          url: sUrl,
          type: "GET",
          async: false,
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            sap.m.MessageToast.show(Message);
          },
          success: function (json) {},
          context: this
        }).done(function (results) {
          myCount = parseInt(results.length)
          myAmount = 0;
          var newAmount = 0;
          for(let s = 0;s < results.length;s++){
            newAmount = parseInt(newAmount) + parseInt(results[s].Price); 
          }
          this.getView().byId("amountid").setText("P" + APPui5.toCommas(newAmount));
          myAmount = newAmount;
          that.oModel.refresh();
          APPui5.closeLoadingFragment();
        });
        that.oModel.refresh();
    },

    onCompute: function(){
      var i = this.byId("Inventory").getSelectedIndices();
      var oList =  this.oModel.getData().InventoryRecord;
      myCount = parseInt(i.length) + parseInt(myCount)
      var newAmount = myAmount;
        for(let x=0;x < i.length;x++){
          var a = i[x];
          newAmount = parseInt(newAmount) + parseInt(oList[a].Price);
        }

        this.getView().byId("amountid").setText("P" + APPui5.toCommas(newAmount));
    },


   

    onAddToCart: function(count){
      var that = this;
      var today = new Date();
      var timeorder = APPui5.formatAMPM(today);
      
      this.onGetDoc("Cart");
      if(myAmount == 0){
        oTRX = parseInt(oTRX) + 1;
        this.onUpdateDoc("Cart",oTRX);
      }

      var i = this.byId("Inventory").getSelectedIndices();
      var oList =  this.oModel.getData().InventoryRecord;
      for(let x=0;x < i.length;x++){
        var a = i[x];
        that.onUpdateInventory(oTRX,timeorder,oList[a].id,localStorage.getItem("RFIDuserName"));
      }
        // sap.m.MessageToast.show("Transactin complete, please place your order before it expire",{duration: 500000});
        // $( ".sapMMessageToast" ).addClass( "Confirm");

       
			MessageBox.information("Transaction complete, please make sure to\n place your order before it expire.", {
				actions: [MessageBox.Action.OK],
				title: "Entrego",
				icon: MessageBox.Icon.QUESTION,
				styleClass:"sapUiSizeCompact",
				onClose: function (sButton) {
					if(sButton === "OK"){
            that.router = that.getOwnerComponent().getRouter();
            that.router.navTo("CustomerDashBoard");
					}
				}
				
			});

       
    },

    onCheckOpenCart: function(){
      var that = this;
      var sUrl = localStorage.getItem("RFID_Server") + "/CheckCart";
      $.ajax({
        url: sUrl,
        type: "GET",
        async: false,
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          sap.m.MessageToast.show(Message);
        },
        success: function (json) {},
        context: this
      }).done(function (results) {
        that.onAddToCart(results);
        that.oModel.refresh();
        APPui5.closeLoadingFragment();
      });
    },

    onUpdateInventory: function(DocNum,Timer,id,userid){
      try{
      var that = this;
      var sUrl = localStorage.getItem("RFID_Server") + "/onAddtoCart?DocNum=" + DocNum + "&Timer=" +  Timer + "&id=" + id + "&userid=" + userid;
      var settings = {
          "url": sUrl,
          "method": "POST",
          "timeout": 0,
        };
        $.ajax(settings).done(function (response) {
          console.log(response);
        });
      }catch (e){
        console.log(e);
      }
  },

    onGetDoc: function(type){
      try{
        var sUrl = localStorage.getItem("RFID_Server") + "/getTransid?type=" + type;
        $.ajax({
          url: sUrl,
          type: "GET",
          async: false,
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            sap.m.MessageToast.show(Message);
          },
          success: function (json) {

          },
          context: this
        }).done(function (results) {
          oTRX = results[0].DocNum;
        });
      }catch (e){
        console.log(e);
      }
    },


    onUpdateDoc: function(type,Doc){
      try{
      var sUrl = localStorage.getItem("RFID_Server") + "/updateTransid?Type=" + type + "&Doc=" + Doc;
      console.log(sUrl)
        var settings = {
          "url": sUrl,
          "method": "POST",
          "timeout": 0,
        };
        $.ajax(settings).done(function (response) {
          console.log(response);
        });
      }catch (e){
        console.log(e);
      }
  },

  });
});
