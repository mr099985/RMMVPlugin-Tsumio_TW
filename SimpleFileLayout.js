//=============================================================================
// SimpleFileLayout.js
// 簡單存讀檔畫面版面
// ----------------------------------------------------------------------------
// Copyright (c) 2017 Tsumio
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.3 2017/10/31 拡張用の描画メソッド追加。
// 1.0.2 2017/10/27 セーブデータが存在しない場合、ピクチャを消去するよう修正。
// 1.0.1 2017/10/26 セーブデータが存在しないとエラー落ちする不具合の修正。
// 1.0.0 2017/10/25 公開。
// ----------------------------------------------------------------------------
// [GitHub] : https://github.com/Tsumio/rmmv-plugins
// [Blog]   : http://ntgame.wpblog.jp/
// [Twitter]: https://twitter.com/TsumioNtGame
//=============================================================================
/*:
 * @plugindesc [ ver.1.0.3 ] 更改存讀檔案畫面設計。
 * @author ツミオ( 翻譯 : ReIris )
 *
 * @param ----基本設定----
 * @text ----基本設定----
 * @desc 
 * @default 
 * 
 * 
 * @help 一個可更改存讀檔案畫面設計的插件。
 * 
 * 【特徵】
 * ・更改存讀檔畫面的設計。
 * ・可以根據隊長角色來顯示立繪。
 * 
 * 【使用方法】
 * 導入插件後將改變存讀檔畫面設計。
 * 
 * 可以根據隊長角色顯示立繪，在角色的注釋欄輸入以下內容。
 * <stand_sfl:["檔案名稱","X 座標","Y 座標"]>
 * 
 * 範例：<stand_sfl:["Package2_8","50","150"]>
 * 
 * 將從 img / tsumio 資料夾中讀取圖片檔案。
 * 
 * 
 * 【插件命令】
 * 沒有插件命令。
 * 
 * 
 * 【更新履歴】
 * 1.0.3 2017/10/31 拡張用の描画メソッド追加。
 * 1.0.2 2017/10/27 セーブデータが存在しない場合、ピクチャを消去するよう修正。
 * 1.0.1 2017/10/26 セーブデータが存在しないとエラー落ちする不具合の修正。
 * 1.0.0 2017/10/25 公開。
 * 
 * 【備考】
 * 對於使用此插件造成的任何損害，作者將不承擔任何責任。
 * 
 * 【利用規約】
 * 除非源代碼的版權所有者聲稱自己是他人。
 * 否則未經作者許可，可以對其進行修改和二次發佈。
 * 使用形式（商業用途，R18 禁止用途等）沒有任何限制。
 * 請自由使用。
 * 
 */


(function() {
    'use strict';
    var pluginName = 'SimpleFileLayout';


////=============================================================================
//// Local function
////  These functions checks & formats pluguin's command parameters.
////  I borrowed these functions from Triacontane.Thanks!
////=============================================================================
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return '';
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamString(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value) || 0).clamp(min, max);
    };

    //This function is not written by Triacontane.Tsumio wrote this function !
    var convertParam = function(param) {
        if(param !== undefined){
            try {
                return JSON.parse(param);
            }catch(e){
                console.group();
                console.error('%cParameter is invalid ! You should check the following parameter !','background-color: #5174FF');
                console.error('Parameter:' + eval(param));
                console.error('Error message :' + e);
                console.groupEnd();
            }
        }
    };

    /**
     * Convert to number.Receive converted JSON object.
     * @param {Object} obj
     * 
     */
    //This function is not written by Triacontane.Tsumio wrote this function !
    var convertToNumber = function(obj) {
        for(var prop in obj) {
            obj[prop] = Number(obj[prop]);
        }
        return obj;
    }

////=============================================================================
//// Get and set pluguin parameters.
////=============================================================================
    var param                          = {};
    //Basic Stteings

////==============================
//// Convert parameters.
////==============================
    //None

////==============================
//// Convert to Number.
////==============================
    //None

////==============================
//// Add tsumio folder to ImageManager.
////==============================
    ImageManager.loadTsumio = function(filename) {
        return this.loadBitmap('img/tsumio/', filename, 0, true);
    };

////=============================================================================
//// Scene_File
////  Set new design !
////=============================================================================

    const _Scene_File_createListWindow    = Scene_File.prototype.createListWindow;
    Scene_File.prototype.createListWindow = function() {
        this._helpWindow.height = 0;
        _Scene_File_createListWindow.call(this);
    };

    const _Scene_File_create      = Scene_File.prototype.create;
    Scene_File.prototype.create = function() {
        _Scene_File_create.call(this);
        this.resetWindowsPosAndSize();
        this.createInfoWindow();
    };

    Scene_File.prototype.createInfoWindow = function() {
        const x = this._listWindow.width;
        const y = 0;

        this._infoWindow = new Window_FileInfo(x, y, this.infoWindowWidth());
        this._infoWindow.refresh(this._listWindow.index());
        this.addWindow(this._infoWindow);

        this._listWindow.setChildWindow(this._infoWindow);
    };

    Scene_File.prototype.resetWindowsPosAndSize = function() {
        this._listWindow.width -= this.infoWindowWidth();
    };

    Scene_File.prototype.infoWindowWidth = function() {
        return 300;
    };

////=============================================================================
//// Window_SavefileList
////  Set new design !
////=============================================================================
    Window_SavefileList.prototype.maxVisibleItems = function() {
        return 15;
    };

    Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
        this.drawPlaytime(info, rect.x, rect.y, rect.width);
    };

    const _Window_SavefileList_select    = Window_SavefileList.prototype.select;
    Window_SavefileList.prototype.select = function(index) {
        _Window_SavefileList_select.call(this, index);
        
        if(this.childWindow){
            this.childWindow.refresh(index);
        }
    };

    Window_SavefileList.prototype.setChildWindow = function(window) {
        this.childWindow = window;
    };

////=============================================================================
//// Window_FileInfo
////  Window class for Scene_File
////=============================================================================

    class Window_FileInfo extends Window_Base {
        constructor(x, y, width) {
            super(x, y, width);
        }

        initialize(x, y, width) {
            const height = Graphics.boxHeight;
            super.initialize(x, y, width, height);

            //Initialize data.
            this.spriteActor       = null;
            this._metaData         = null;
        }

        get parentIndex() {
            return this.parentWindow.index();
        }

        get fileName() {
            return this._metaData[0];
        }

        get actorX() {
            return Number(this._metaData[1]);
        }

        get actorY() {
            return Number(this._metaData[2]);
        }

        partyInfo(index) {
            const savefileId = index+1;
            if (DataManager.isThisGameFile(savefileId)){
                const json    = StorageManager.load(savefileId);
                const party   = this.extractSaveContents(JsonEx.parse(json));
                return party;
            }else{
                this.deleteActorPicture();
                return null;
            }
        }

        deleteActorPicture(){
            if(this.spriteActor !== null){
                this.removeChild(this.spriteActor);
                this.spriteActor = null;
            }
        }

        /**
         * Get party contents.
         */
        extractSaveContents(contents) {
            return contents.party;
        };

        refresh(index) {
            const partyInfo = this.partyInfo(index);
            if(!partyInfo){
                return;
            }
            const members = partyInfo.members();
            this.refreshMetaData(members);
            this.removeChild(this.spriteActor);
            this.drawExtraContents();
            this.createActorPicture();
        }

        drawExtraContents() {
            //Example for kurige.
            //this.drawTextEx('aaa',0, 0);
        }

        createActorPicture() {
            if(!this.fileName){
                return;
            }
            //Create and addChild.
            this.spriteActor   = new Sprite(ImageManager.loadTsumio(this.fileName));
            this.spriteActor.x = this.actorX;
            this.spriteActor.y = this.actorY;
            this.addChild(this.spriteActor);
        }

        refreshMetaData(info) {
            if(info.length <= 0){
                //Info do not exsist.
                this._metaData = [null, 0, 0];
                return;
            }

            //Info exsist.
            const actorId = info[0].actorId();//Get first actor id.
            if($dataActors[actorId].meta['stand_sfl']){
                this._metaData = JSON.parse($dataActors[actorId].meta['stand_sfl']);
            }else{
                //Assign blank data.
                this._metaData = [null, 0, 0];
            }
        }
    }

////=============================================================================
//// Debug
////  This static class is for simple debugging.I/O.
////=============================================================================
    class Debug {
        /**
         * Instead of constructor.
         * At debugging, this method should be executed on loaded.
         */
        static on() {
            this._debugMode = true;
            this._stack     = [];
            console.warn(`${this.FILENAME} : Debug mode turned ON.`);
        }

        /**
         * Instead of constructor.
         * At release, this method should be executed on loaded.
         */
        static off() {
            this._debugMode = false;
            this._stack     = [];
            console.warn(`${this.FILENAME} : Debug mode turned OFF.`);
        }

        static get FILENAME(){
            return 'SimpleFileLayout';
        }

        static get isDebugMode() {
            return this._debugMode;
        }

        static outputStack() {
            if(!this.isDebugMode){
                return;
            }

            if(this._stack.length > 0){
                this._stack.forEach(function(element) {
                    console.log(element);
                }, this);
                return `Stack length is ${this._stack.length}.`;
            }
            return 'Stack length is 0.';
        }

        static clearStack() {
            if(!this.isDebugMode){
                return;
            }

            this._stack = [];
        }

        static push(arg) {
            if(!this.isDebugMode){
                return;
            }

            this._stack.push(arg);
        }

        /**
         * Private method.
         * @param {Function} func
         * @param {Array} args
         */
        static _output(func, args) {
            if(!this.isDebugMode){
                return;
            }

            args = Array.prototype.slice.call(args);//ES6: Array.from(args);
            for(var arg of args) {
                console[func](arg);
                this.push(args);
            }
        }

        static log(args) {
            this._output('log', arguments);
        }

        static dir(args) {
            this._output('dir', arguments);
        }

        static info(args) {
            this._output('info', arguments);
        }

        static warn(args) {
            this._output('warn', arguments);
        }

        static error(args) {
            this._output('error', arguments);
        }

        static assert(test, message, optionalParam) {
            if(!this.isDebugMode){
                return;
            }

            console.assert(test, message, optionalParam);
        }

        static modify() {
            this._debugMode = !this._debugMode;
            var status      = this._debugMode ? 'ON' : 'OFF';
            console.warn(`Debug mode turned ${status}.`);
        }
    }

    //Debug.on();
    Debug.off();

})();
