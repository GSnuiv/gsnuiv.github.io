$.fn.extend({
/* FUNCIONES ACCESO DOM
*
*/
    //fetchToTable: function(listado,args) {            
    //    //totalreg = listado.total;        
    //    listado = listado.listado;
    //    var idtable = this.attr('id');         
    //    var total = listado.length;        
    //    //Debbugin line
    //    if(args.debug){console.log('idtable: '+ idtable); }
    //    var insertar = '';                
    //    if(total == 0){             
    //        return 0;
    //    }else{        
    //        for(var i=0;i<total;i++){
    //            insertar += '<tr id="reg_'+idtable+'_'+i+'">';
    //            var campos =  Object.keys(listado[i]);
    //            var ncampos=  Object.keys(listado[i]).length;
    //            for(var j=0;j<ncampos;j++){
    //                campo = campos[j];
    //                insertar += '<td class="'+campo+'">'+ eval('listado[i].'+ campo)+'</td>';
    //            }
    //            insertar += '</tr>';    
    //        }            
    //    }        
    //    $('#'+idtable+' tbody').append(insertar);         
    //},
    fetchToTable: function(listado,args) {      
        var parcial = listado.listado.length; 
        var total = listado.totalmatch;        
        var idtable = this.attr('id');                 
        if (typeof(args.opt.limit) === "number" ) {
            var start = args.opt.start;
            var limit = args.opt.limit;
            var pagination = start+'-'+(start+parcial);        
            var insertar = '';       
            if(args.pagination){
                $("#"+args.pagination).html(pagination);
                $("#"+args.pagination+'-total').html(total);
            }                            
        }
        var listado = listado.listado;
        //Debuggin        
        if(args.debug){console.log('Entra en la funcion fetchToTable');}
        if(args.debug){console.log(' idtable: '+idtable);}        
        if(args.debug){console.log(' Ha recuperado '+parcial+' registros');}
        //EndDebuggin

        if(parcial == 0){ 
            insertar = '<tr><td colspan="100%">No hay resultados</td></tr>';
        }else{        
            for(var i=0;i<parcial;i++){
                insertar += '<tr id="reg_'+idtable+'_'+i+'">';
                var campos =  Object.keys(listado[i]);
                var ncampos=  Object.keys(listado[i]).length;
                for(var j=0;j<ncampos;j++){
                    campo = campos[j];                    
                    insertar += '<td class="'+campo+'">'+ eval('listado[i].' + [ campos[j] ] )+'</td>';
                }
                insertar += '</tr>';    
            }            
        } 
        /*Debuggin*/ if(args.debug){console.log(' Sale al haber recorrido toda la lista' + insertar);}        
        $('#'+idtable+' tbody').html(insertar); 
    },    

    fetchTo: function(listado,args){
    	var idtable = this.attr('id');               
    	//Debbugin line
        if(args.debug){console.log(listado.listado[0]); }

        $.each(listado.listado,function(index, value) {
        	//console.log('indice'+value);        	
            $('#'+idtable).append(value);             
        });
    },

    showIn: function(listado,args){
        var idtable = this.attr('id');   
        var parcial = listado.listado.length;    
        var total = listado.totalmatch;
        var start = args.opt.start;
        var limit = args.opt.limit;
        var pagination = start+'-'+(start+parcial);
        if(args.pagination){
            $("#"+args.pagination).html(pagination);
            $("#"+args.pagination+'-total').html(total);
        }

        //Debbugin line
        if(args.debug){console.log(args); }
        var elHtml = '';

        $.each(listado.listado,function(index, value) {
            //console.log('indice'+value);          
            elHtml += value;
        });
        $('#'+idtable).html(elHtml);             
    },

    
    showAlert: function(str,delay){
        delay = typeof delay !== 'undefined' ? a : 1500;       
        this.html(str)
        this.show().delay(delay).fadeOut();
    },

    

/* FUNCIONES ACCESO DATOS
*
*/
    buscarDatos: function(args,callback){          
        var idtable = this.attr('id');
        if (typeof args.functionDom === 'undefined') {
            args.functionDom = 'fetchTo'; 
        }
        //*Debuggin
        if(args.debug){console.log('<br>funcion: '+args.functionDom);}            

        //Si necesitamos un objeto con una respuesta la peticion no puede ser asincrona
        var sincro = true;
        //if(args.Objtresp){ sincro = false; }
		
        var funcion = args.functionDom;
        var datos = {metodo:args.metodo, search: args.cadena, filter:args.filter, opt:args.opt};                
        var peticion = $.ajax({         
            url: args.modelo,
            async: sincro,         
            type: 'POST',            
            data: datos,
            jaber: 'laber',
        });       
        //Debuggin
        if(args.debug){ console.log('modelo: '+args.modelo); }      
    
        peticion.done(function(data, textStatus, jqXHR) {                                
            //Debuggin
            if(args.debug){console.log('respuesta: '+data);}
            data = JSON.parse(data);
            listado = data.listado;            
            var resp = $("#"+idtable)[funcion](data, args);                        
            if(typeof resp != 'undefined'){                
                eval (args.Objtresp);
            }                        
        });
        
        peticion.fail(function(jqXHR, textStatus, errorThrown) {
            $('#contenedor').append("Error creando: " + errorThrown +" -- " +jqXHR.responseText);
        });   

        /*if(typeof callback == 'function') { // make sure the callback is a function
            callback.call(this); // brings the scope to the callback            
        }else{
            console.log('typeof callback: '+ typeof callback);
        } */         
    },

    autoFill:function(args){
        var idinput = this.attr('id');        
        var datos = {
            metodo:args.metodo,
        };
        var peticion = $.ajax({         
            url: args.modelo,            
            type: 'POST',
            data: args,
        });
      
        peticion.done(function(data, textStatus, jqXHR) {    
            var valorOriginal = $("#"+args.diminput).val();               
            data = JSON.parse(data);
            var listado = data.listado;            
            //Comprobamos si ya tiene valor y en tal caso le aplicamos su etiqueta correspondiente
            if(valorOriginal > 0 ){
                $.each(listado, function(i, v) {
                    if (v.id == valorOriginal) {
                         $('#'+idinput).val(v.label);
                        return;
                    }
                });
            //}else{
            //    //QUE SEA OPCIONAL
            //    $('#'+idinput).addClass("ui-state-error");
            }
            $('#'+idinput).autocomplete({
                source: listado,                
                minLength:0,
                select: function(event,ui){
                    $("#"+args.diminput).val(ui.item.id);
                    //$('#'+idinput).removeClass("ui-state-error");
                    //$("#alertSave").switchClass( "alert-saved", "alert-unsaved",1);
                    //$("#alertSave").html('Guardar Ahora');
                }
            });
            $('#'+idinput).on('dblclick', function(){
                $(this).autocomplete("search","");
            });
        });
        
    },

   

});
 