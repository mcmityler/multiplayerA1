using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using UnityEngine.UI;

public class AWSManager : MonoBehaviour
{
    private class PlayerDataRegisterLogin{
        public string user_id;
        public string password;
    }
    private class PlayerDataShop{
        public string user_id;
        public string cookieGiven;
        public string item_entered;
        public bool buyingItem;
        public bool sellingItem;
        
    }
    [SerializeField] private Text _userIDText;
    [SerializeField] private Text _passwordText;
    [SerializeField] private Text _outputText;
    [SerializeField] private Text _userIDLoginText;
    [SerializeField] private Text _passwordLoginText;
    [SerializeField] private Text _outputLoginText;
    [SerializeField] private Text _userIDSearchText;
    [SerializeField] private Text _outputSearchText;
     [SerializeField] private Text _userIDShopText;
    [SerializeField] private Text _outputShopText;
     [SerializeField] private Text _cookieTextbox;
    [SerializeField] private Text _moneyText;
    [SerializeField] private Text _enteredItemIDText;

    private string json; 
    private bool registering = false;
    private bool loggingIn = false;
    private bool searching = false;
    private bool buyingItem = false;
    private bool sellingItem = false;
    public void  Register(){
        PlayerDataRegisterLogin _p = new PlayerDataRegisterLogin();
        _p.user_id = _userIDText.text;
        _p.password = _passwordText.text;
         json = JsonUtility.ToJson(_p);
        registering = true;
        //UnityWebRequest www = UnityWebRequest.Post("https://2kl972n8bl.execute-api.us-east-1.amazonaws.com/default/resgister-new-profile", json);
       // www.SetRequestHeader("Accept", "application/json");
        //yield return www.SendWebRequest();
        targetURL = REGISTERPROFILE_URL;
        this.StartCoroutine(this.RequestRoutine(this.targetURL, this.ResponseCallback));
    }
    public void Login(){
         PlayerDataRegisterLogin _p = new PlayerDataRegisterLogin();
        _p.user_id = _userIDLoginText.text;
        _p.password = _passwordLoginText.text;
        json = JsonUtility.ToJson(_p);
        loggingIn = true;
        //UnityWebRequest www = UnityWebRequest.Post("https://2kl972n8bl.execute-api.us-east-1.amazonaws.com/default/resgister-new-profile", json);
       // www.SetRequestHeader("Accept", "application/json");
        //yield return www.SendWebRequest();
        targetURL = LOGINPROFILE_URL;
        this.StartCoroutine(this.RequestRoutine(this.targetURL, this.ResponseCallback));
    }
    public void BuyItem(){
        buyingItem = true;
        Shop();
    }
    public void SellItem(){
        sellingItem = true;
        Shop();
    }
    public void Shop(){
         PlayerDataShop _p = new PlayerDataShop();
        _p.user_id = _userIDShopText.text;
        _p.cookieGiven = _cookieTextbox.text;
        _p.item_entered = _enteredItemIDText.text;
        _p.sellingItem = sellingItem;
        _p.buyingItem = buyingItem;
        json = JsonUtility.ToJson(_p);
        //UnityWebRequest www = UnityWebRequest.Post("https://2kl972n8bl.execute-api.us-east-1.amazonaws.com/default/resgister-new-profile", json);
       // www.SetRequestHeader("Accept", "application/json");
        //yield return www.SendWebRequest();
        targetURL = SHOP_URL;
        this.StartCoroutine(this.RequestRoutine(this.targetURL, this.ResponseCallback));
    }
    public void DisplayPublic(){
        searching = true;
         targetURL = SEARCH_URL + _userIDSearchText.text;
        this.StartCoroutine(this.SearchRoutine(this.targetURL, this.ResponseCallback));
        
    }




    const string REGISTERPROFILE_URL = "https://2kl972n8bl.execute-api.us-east-1.amazonaws.com/default/resgister-new-profile";
    const string LOGINPROFILE_URL = "https://35g7lrn8d0.execute-api.us-east-1.amazonaws.com/default/login-profile";
    const string SHOP_URL = "https://ce2yhuca6b.execute-api.us-east-1.amazonaws.com/default/update-inventory";
    const string SEARCH_URL = "https://2kq0xawf09.execute-api.us-east-1.amazonaws.com/default/get-profile-details?user_id=";

    string targetURL = REGISTERPROFILE_URL;

    // Keep track of what we got back
     string recentData = "";
 
     // Web requests are typially done asynchronously, so Unity's web request system
     // returns a yield instruction while it waits for the response.
     //
     private IEnumerator RequestRoutine(string url, Action<string> callback = null)
     {
         // Using the static constructor
         var request = UnityWebRequest.Put(url, json);
 
         // Wait for the response and then get our data
         yield return request.SendWebRequest();
         var data = request.downloadHandler.text;
 
         // This isn't required, but I prefer to pass in a callback so that I can
         // act on the response data outside of this function
         if (callback != null)
             callback(data);
        
        
        if(registering){
             _outputText.text = recentData;
             registering = false;
        }
        else if (loggingIn){
            _outputLoginText.text = recentData;
            loggingIn = false;
        }else if(sellingItem){
            _outputShopText.text = recentData;
            sellingItem = false;
        }else if(buyingItem){
            _outputShopText.text = recentData;
            buyingItem = false;
        }
     }
     private IEnumerator SearchRoutine(string url, Action<string> callback = null)
     {
         // Using the static constructor
         var request = UnityWebRequest.Get(url);
 
         // Wait for the response and then get our data
         yield return request.SendWebRequest();
         var data = request.downloadHandler.text;
 
         // This isn't required, but I prefer to pass in a callback so that I can
         // act on the response data outside of this function
         if (callback != null)
             callback(data);
        
         if(searching){
            _outputSearchText.text = recentData;
            searching = false;
        }
     }
 
     // Callback to act on our response data
     private void ResponseCallback(string data)
     {
         Debug.Log(data);
         recentData = data;
         
     }


    [SerializeField] private GameObject inventoryPanel;
    [SerializeField] private GameObject loginPanel;
    [SerializeField] private GameObject registerPanel;
    [SerializeField] private GameObject searchPanel;
     public void OpenInventoryPanel(){
        inventoryPanel.SetActive(true);
        loginPanel.SetActive(false);
        registerPanel.SetActive(false);
        searchPanel.SetActive(false);
     }
     public void OpenLoginPanel(){
         inventoryPanel.SetActive(false);
        loginPanel.SetActive(true);
        registerPanel.SetActive(false);
        searchPanel.SetActive(false);
     }
     public void OpenRegisterPanel(){
         inventoryPanel.SetActive(false);
        loginPanel.SetActive(false);
        registerPanel.SetActive(true);
        searchPanel.SetActive(false);
     }
     public void OpenSearchPanel(){
         inventoryPanel.SetActive(false);
        loginPanel.SetActive(false);
        registerPanel.SetActive(false);
        searchPanel.SetActive(true);
     }
}