/*
 *    Copyright (C) 2014  Kaer 
 *
 *    This program is free software; you can redistribute it and/or modify
 *    it under the terms of the GNU General Public License as published by
 *    the Free Software Foundation; either version 2 of the License, or
 *    (at your option) any later version.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU General Public License for more details.
 *
 *    You should have received a copy of the GNU General Public License along
 *    with this program; if not, write to the Free Software Foundation, Inc.,
 *    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 *    
 *    Modern Calc 0.0.1, Kaer (C) 2014 Kaer
 *    Modern Calc comes with ABSOLUTELY NO WARRANTY.
 *
 *    Author: Kaer (the.thin.king.way+2014@gmail.com)
 *    Project url: https://github.com/kaer/gnome-shell-extension-modern-calc
 *
 */

const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Panel = imports.ui.panel;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Me = ExtensionUtils.getCurrentExtension();
const AppHeader = Me.imports.app_header;
const Dialog = Me.imports.dialog;
const Utils = Me.imports.utils;

// will be loaded on demand
let CalculatorModule;
let UnitConvertorModule;

const ModernCalc = new Lang.Class({
    Name: "ModernCalc",
    Extends: Dialog.Dialog,
    
    _init: function() {

        this._prefs = {  //TODO get from preferences file
            calculator_enabled: 1,
            unit_convertor_enabled: 1,
            default_module: 'calculator'
        };

        let params = {
            width_percents: 26,
            height_percents: 100, 
            animation_time: 0.5,
            style_class: 'modern-calc',
        };
        this.parent(params);
        
        
        this._appHeader = null;


        this._loadedModules = false;
        this._activeModule = false;

        this._prepareInterface();
        
    },
    _prepareInterface: function(){
        // add header
        this._appHeader = new AppHeader.AppHeader();
        this.boxLayout.add(this._appHeader.actor, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });

        // add toolbar
        this._toolbar = new St.BoxLayout({
            style_class: 'toolbar',
            vertical: false
        });
        this.boxLayout.add(this._toolbar, {
            expand: false,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.MIDDLE
        });


        this._moduleContainer = new St.BoxLayout({
            style_class: 'module-container',
            vertical: true
        });

        // load modules
        this._loadModules();

        this.boxLayout.add(this._moduleContainer, {
            expand: true,
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });
       
    },

    _loadModules: function(){

        let moduleIndex = 0;
        let module_to_activate = false;
        let loaded_module_name;
        let default_module = this.get_preference('default_module');

        this._loadedModules = new Array();

        
        if(this.get_preference('calculator_enabled') == 1){
            CalculatorModule = Me.imports.calculator_module;

            this._loadedModules[moduleIndex] =  new CalculatorModule.CalculatorModule({
               app:this
            });

            loaded_module_name = this._loadedModules[moduleIndex].get_module_name();
            if(!module_to_activate && default_module != undefined && default_module == loaded_module_name){
                module_to_activate = loaded_module_name;
            }

            moduleIndex++;
        }

        if(this.get_preference('unit_convertor_enabled') == 1){
            moduleIndex++;
            UnitConvertorModule = Me.imports.unit_convertor_module;

            this._loadedModules[moduleIndex] =  new UnitConvertorModule.UnitConvertorModule({
               app:this
            });

            loaded_module_name = this._loadedModules[moduleIndex].get_module_name();
            if(!module_to_activate && default_module != undefined && default_module == loaded_module_name){
                module_to_activate = loaded_module_name;
            }    
        }

        this._initToolbar();

        // show default module
        if(module_to_activate != false){
            this.show_module(module_to_activate);
        }
    },


    _initToolbar: function(){
        if(this._toolbar && this._loadedModules){
            // load toolbar buttons
            let toolbarButton;
            let currModule;
            for(let i = 0; i < this._loadedModules.length; i++){
                currModule = this._loadedModules[i];

                if(currModule){
                    toolbarButton = currModule.get_toolbar_button();

                    this._toolbar.add(toolbarButton, {
                        expand: false,
                        x_align: St.Align.START,
                        y_align: St.Align.START
                    });
                }
            }
        }
    },

    show_module: function(module_name){
  
        if(module_name != false){

            // remove last shown module (at the moment yet active module)
            if(this._activeModule){    

                //TODO animate
                this._moduleContainer.remove_child(this._activeModule.actor);
            }

            let module = false;
            let currModule;
            for(let k=0; k < this._loadedModules.length; k++){
                currModule = this._loadedModules[k];

                if(currModule && module_name == currModule.get_module_name()){
                    module = currModule;
                    break;
                }
            }

            if(module != false){
                // load the found module
                this._moduleContainer.add(module.actor, {
                    expand: false,
                    x_align: St.Align.START,
                    y_align: St.Align.START
                });

                //TODO set the module button as active

                // set the active module
                this._activeModule = module;
            }
        }
    },

    get_preference: function(preference_name){
        if(this._prefs){
            if(this._prefs.hasOwnProperty(preference_name)){
                return this._prefs[preference_name];
            }
        }
        return undefined;
    },

    destroy: function(){
        this._toolbar.destroy();
        this._moduleContainer.destroy();

        this.parent();
    },

    get active_module(){
        return this._activeModule;
    }


});