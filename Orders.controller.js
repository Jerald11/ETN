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
  var oQty = 0;
  var oAmount;
  return Controller.extend("claims.Entrego.view.Orders", {
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
                oView.getController().onLoadOrders();
                oView.getController().onLoadpaid();
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


      onLoadRecords: function () {
        var that = this;
        var sUrl = localStorage.getItem("RFID_Server") + "/getMyOrder?Status=Reserved&UserID=" + localStorage.getItem("RFIDuserName");
  
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
          this.oModel.getData().InventoryRecord = [];
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
                "ExpiryTime": results[i].ExpiryTime
              })
              } catch (e){
                console.log(e);
            }
          }
          that.oModel.refresh();
          APPui5.closeLoadingFragment();
        });
      },

      onLoadOrders: function () {
        var that = this;
        console.log()
        var sUrl = localStorage.getItem("RFID_Server") + "/getOrderHeader?&UserID=" + localStorage.getItem("RFIDuserName") + "&Status=O";
        this.oModel.getData().Ordered = [];
        var oHeader = [];
        var oDetails = [];
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
          for(let i = 0;i < results.length;i++){
          $.ajax({
            url: localStorage.getItem("RFID_Server") + "/getOrderDetails?&TransactionID=" + results[i].TransactionID,
            type: "GET",
            async: false,
            error: function (xhr, status, error) {
              var Message = xhr.responseJSON["error"].message.value;
              sap.m.MessageToast.show(Message);
            },
            success: function (json) {},
            context: this
          }).done(function (result) {
            oDetails = [];
            for(let x = 0;x < result.length;x++){
              oDetails.push({
                "TransactionID": result[x].TransactionNo,
                "Discount": result[x].SKU_Name,
                "OrderDate":  result[x].SKU_Code,
                "Count": result[x].Quantity,
                "Amount": result[x].Price,
                "Duration": result[x].SKU_Description,
                "Charge": results[i].Charge
              })
            }
          });

            oHeader.push({
                "ID": 14,
                "TransactionID": results[i].TransactionID,
                "Discount":  results[i].Discount,
                "Charge": results[i].Charge,
                "Amount":  results[i].Amount,
                "OrderDate":  results[i].OrderDate,
                "Duration":  results[i].Duration,
                "Count": results[i].Count,
                "Details": oDetails
            })
          }

          this.oModel.getData().Ordered = oHeader
          
        
          that.oModel.refresh();
          APPui5.closeLoadingFragment();
        });
      },


      onLoadpaid: function () {
        var that = this;
        var sUrl = localStorage.getItem("RFID_Server") + "/getOrderHeader?&UserID=" + localStorage.getItem("RFIDuserName") + "&Status=P";
        this.oModel.getData().Paid = [];
        var oHeader = [];
        var oDetails = [];
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
          for(let i = 0;i < results.length;i++){
          $.ajax({
            url: localStorage.getItem("RFID_Server") + "/getOrderDetails?&TransactionID=" + results[i].TransactionID,
            type: "GET",
            async: false,
            error: function (xhr, status, error) {
              var Message = xhr.responseJSON["error"].message.value;
              sap.m.MessageToast.show(Message);
            },
            success: function (json) {},
            context: this
          }).done(function (result) {
            oDetails = [];
            for(let x = 0;x < result.length;x++){
              oDetails.push({
                "TransactionID": result[x].TransactionNo,
                "Discount": result[x].SKU_Name,
                "OrderDate":  result[x].SKU_Code,
                "Count": result[x].Quantity,
                "Amount": result[x].Price,
                "Duration": result[x].SKU_Description,
                "Charge": results[i].Charge
              })
            }
          });

            oHeader.push({
                "ID": 14,
                "TransactionID": results[i].TransactionID,
                "Discount":  results[i].Discount,
                "Charge": results[i].Charge,
                "Amount":  results[i].Amount,
                "OrderDate":  results[i].OrderDate,
                "Duration":  results[i].Duration,
                "Count": results[i].Count,
                "Details": oDetails
            })
          }

       
          this.oModel.getData().Paid = oHeader
          
        
          that.oModel.refresh();
          APPui5.closeLoadingFragment();
        });
      },
      

      onCompute: function(){
        discount = 0;
        oQty = 0;
        var i = this.byId("Inventory").getSelectedIndices();
        if(i.length > 10 && i.length <= 20){
          discount = 60;
        }else if(i.length >= 21){
          discount = 70;
        }

        var value1 = parseInt(discount) / 100;
        var value2 = 1 - value1;

        var oList =  this.oModel.getData().InventoryRecord;
        myCount = parseInt(i.length) + parseInt(myCount)
        var newAmount = myAmount;
          for(let x=0;x < i.length;x++){
            var a = i[x];
            newAmount = parseInt(newAmount) + parseInt(oList[a].Price);
            oQty +=1;
          }
         
          var withDiscount = (newAmount * value2);
          oAmount = (Math.round(withDiscount)).toFixed(2);
          (Math.round(withDiscount)).toFixed(2);
          this.getView().byId("amountid").setText("P" + (Math.round(withDiscount)).toFixed(2) + "(" + discount + "% Discount) for " + oQty + " Items");
      },

      OnCreateOrder: function(){
        var i = this.byId("Inventory").getSelectedIndices();
        if(i.length !== 0){
          var today = new Date();
          var tomorrow = new Date();
          tomorrow.setDate(today.getDate()+3);
          var oDate = APPui5.getDateFormat(today);
          var OrderDate = APPui5.getDateFormat(today) + " " + APPui5.Timeformater(today);
          var duration = APPui5.getDateFormat(tomorrow) + " " + APPui5.Timeformater(today);
          console.log(discount)
          var oList =  this.oModel.getData().InventoryRecord;
          this.onGetDoc("Order");
          oTRX = parseInt(oTRX) + 1;
          this.onUpdateDoc("Order",oTRX);
          var isCharge = 0;
          for(let x=0;x < i.length;x++){
            var a = i[x];
            this.onUpdateInventory(oTRX,oList[a].id,localStorage.getItem("RFIDuserName"),oDate);
            // if(oList[0].Category !== oList[a].Category){
            //   isCharge = "100";
            // }

          }
          this.OnInsertOrder(localStorage.getItem("RFIDuserName"),oTRX,discount,isCharge,oAmount,OrderDate,duration);
         
          var that = this;
          MessageBox.information("Orders complete, please make sure to\n pay your order before it expire.", {
            actions: [MessageBox.Action.OK],
            title: "Entrego",
            icon: MessageBox.Icon.QUESTION,
            styleClass:"sapUiSizeCompact",
            onClose: function (sButton) {
              if(sButton === "OK"){
                that.onLoadRecords();
                that.onLoadOrders();
                that.onLoadpaid();
                that.oModel.refresh();
              }
            }
          });
        
        }
      },

  
      onUpdateInventory: function(DocNum,id,userid,OrderDate){
        try{
        var that = this;
        var sUrl = localStorage.getItem("RFID_Server") + "/oUpdateInventory?DocNum=" + DocNum + "&id=" + id + "&userid=" + userid + "&OrderDate=" + OrderDate;
        var settings = {
            "url": sUrl,
            "method": "POST",
            "timeout": 0,
          };
          $.ajax(settings).done(function (response) {
          
          });
        }catch (e){
          console.log(e);
        }
      },


      onUpdateInventory: function(DocNum,id,userid,OrderDate){
        try{
        var that = this;
        var sUrl = localStorage.getItem("RFID_Server") + "/oUpdateInventory?DocNum=" + DocNum + "&id=" + id + "&userid=" + userid + "&OrderDate=" + OrderDate;
        var settings = {
            "url": sUrl,
            "method": "POST",
            "timeout": 0,
          };
          $.ajax(settings).done(function (response) {
          
          });
        }catch (e){
          console.log(e);
        }
      },


      onPressUpdateOrder: function(){
        var i = this.byId("Orders").getSelectedIndices();
        var oList =  this.oModel.getData().Ordered;
        for(let x=0;x < i.length;x++){
          var a = i[x];
          this.onUpdateOrder(oList[a].TransactionID);
          this.onUpdateOrderInv(oList[a].TransactionID);
        }

        this.onLoadRecords();
        this.onLoadOrders();
        this.onLoadpaid();
      },

      onUpdateOrder: function(id){
        try{
        var sUrl = localStorage.getItem("RFID_Server") + "/onUpdateOrder?id=" + id;
        var settings = {
            "url": sUrl,
            "method": "POST",
            "timeout": 0,
          };
          $.ajax(settings).done(function (response) {
          
          });
        }catch (e){
          console.log(e);
        }
      },

      onUpdateOrderInv: function(id){
        try{
        var sUrl = localStorage.getItem("RFID_Server") + "/onUpdateOrderInv?id=" + id;
        var settings = {
            "url": sUrl,
            "method": "POST",
            "timeout": 0,
          };
          $.ajax(settings).done(function (response) {
          
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

      onPressUpload: function(){
        if (!this.UploadFA) {
          this.UploadFA = sap.ui.xmlfragment("claims.Entrego.view.fragment.UploadAttachment", this);
          this.getView().addDependent(this.UploadFA);
        }
        this.UploadFA.open();
        sap.ui.getCore().byId("fileUploader1").setValue("");
      },

      
      onCancelUpload: function(){
        if(this.UploadFA){
          this.UploadFA.close();
        }
      },


      handleAttachment: function (oEvent) {
        var aFiles = oEvent.getParameters().files;
        this.currentFile = aFiles[0];
        var FileName = this.getView().byId("fileUploader1").getValue();
        var form = new FormData();
        form.append("file", this.currentFile, FileName);
        console.log(form)
        
        var settings = {
          "url": "http://18.167.84.197:3002/upload",
          "method": "POST",
          "timeout": 0,
          "processData": false,
          "mimeType": "multipart/form-data",
          "contentType": false,
          "data": form,
          "crossDomain": true,
					"xhrFields": {
						"withCredentials": true
					},
        };

        $.ajax(settings).done(function (response) {
          console.log(response);
        });


        // this.onPressUpdateOrder(); 
        // sap.m.MessageToast.show("MulterError: Unexpected field");
        // $( ".sapMMessageToast" ).addClass( "Error");
      },


      onUpdateDoc: function(type,Doc){
        try{
        var sUrl = localStorage.getItem("RFID_Server") + "/updateTransid?Type=" + type + "&Doc=" + Doc;
          var settings = {
            "url": sUrl,
            "method": "POST",
            "timeout": 0,
          };
          $.ajax(settings).done(function (response) {
          });
        }catch (e){
          console.log(e);
        }
      },

    OnInsertOrder: function(UserID,TransactionID,Discount,Charge,Amount,OrderedDate,Duration){
      try{
      var sUrl = localStorage.getItem("RFID_Server") + "/InsertOrder?UserID=" + UserID + "&TransactionID=" + TransactionID + "&Charge=" + Charge + "&Discount=" + Discount + "&Amount=" + Amount + "&OrderedDate=" + OrderedDate + "&Duration=" + Duration;
        var settings = {
          "url": sUrl,
          "method": "POST",
          "timeout": 0,
        };
        $.ajax(settings).done(function (response) {
        });
      }catch (e){
        console.log(e);
      }
    },

    CheckInventory: function (ItemCode) {

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

  });
});
