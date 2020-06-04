$(document).ready(() => {
  let appTable = $('#applications_tbl').DataTable( {
    ajax: function(data, callback, settings) {
      $.ajax({
        url: '/application/all',
        method: 'get',
        dataType: "json",
        processing: true,
        success: function(result){
          var apps = [];
          $(result).each(function(index, element){
            apps.push({
              "id" : (element.id != null ? element.id : ""),
              "name" : (element.name != null ? element.name : ""),
              "description": (element.description != null ? element.description : ""),
              "email": (element.email != null ? element.email : ""),
              "owner": (element.owner != null ? element.owner : "")
            });
          });
          callback({aaData:apps});
        }
      });
    },  
    columns: [
      { title: "Name", data:"name", width:'440px' },
      { title: "Description", data:"description", width:'440px' },
      { title: "Contact Email", data:"email", width:'440px' },
      { title: "Owner", data:"owner", width:'440px' },
      { title: "", data: "", width:'10px',
          render: function ( data, type, full, meta ) {
            return '<span class="app-edit"><i class="fa fa-pencil"></i></span>&nbsp;&nbsp;<span class="app-delete"><i class="fa fa-times-circle"></i></span>';
          }
      }
    ]
  });
  $( appTable.table().container() ).removeClass( 'form-inline' );    


   //Add Application button
  $('.add-app-btn').on('click', () => {
    rolesTable.clear().draw();
    $('#roles-permission-form').trigger("reset");
    $('#create-app-modal #create_app').html('Create Application');
    $('#create-app-modal').modal();    
  });

  //Applications table
  $("#applications_tbl tbody").on('click', ".app-edit", (evt) => {    
    var data = appTable.row($(evt.target).parents('tr')).data();
    $('#create_app').html('Update Application')
    getApplicationDetails(data[Object.keys(data)[0]]);    
  })  

  $("#applications_tbl tbody").on('click', ".app-delete", (evt) => {    
    $( "#delete-app-confirm" ).dialog({
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Yes": function() {
          var data = appTable.row($(evt.target).parents('tr')).data();
          fetch('/application?id='+data[Object.keys(data)[0]], {
            method: 'delete'
          })
          .then(response => response.json())
          .then((application) => {
            //console.log('success');
            $('#applications_tbl').DataTable().ajax.reload();
            $( this ).dialog( "close" );
          });   
        },
        No: function() {
          $( this ).dialog( "close" );
        }
      }
    });         
  })   

  //permissions tab
  let applicationPermissions = [], uniquePermissions=[];
  let rolesTable = $('#app_roles_tbl').DataTable( {
    "paging": false,
    "info": false,
    "searching": false,
    data: applicationPermissions,
    columns: [
      { title: "Name", data:"name" },     
      { title: "Permissions", data: "permissions", 
        render: function(data, type, full, meta) {
          let renderHtml = '<div class="dropdown">'+
            '<button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
              'Permissions'+
            '</button>'+
            '<div class="dropdown-menu select-permissions">'+
              '<form class="px-4 py-3">';
              uniquePermissions.forEach((permission) => { 
                let checked = ($.grep(data, function(n) { return n.name == permission })).length > 0 ? 'checked' : ''; 
                renderHtml += '<div class="form-check available-permissions">' +                               
                  '<input type="checkbox" '+checked+' class="form-check-input" value="'+permission+'" >'+
                  '<label class="form-check-label" >'+
                    permission +
                  '</label>'+
                '</div>';                
              });              
              renderHtml += '</form>'+
              '<div class="dropdown-divider"></div>'+
              '<div class="row">'+  
                '<div class="col permission-container"><input type="text" class="form-control" id="newPermission" placeholder=""></div>'+
                '<div class="col col-sm-4"><a href="#" class="btn btn-secondary btn-sm active create-permission" role="button" aria-pressed="true">Create</a></div>'+
              '</div>'+  
              '</div>'+
            
            '</div></div>';
          return renderHtml;
        }
      }, 
      { title: "", data: "", width:'10px',
        render: function ( data, type, full, meta ) {
          return '<span class="delete_permission"><i class="fa fa-times-circle"></i></span>';
        }
      }
    ]
  });  
  $( rolesTable.table().container() ).removeClass( 'form-inline' );  

  let addPermissions = (evt) => {
    //console.log($(evt.target).parent().siblings().find('input').val());
    evt.preventDefault();
    evt.stopPropagation();
    if($(evt.target).parent().siblings().find('input').val() != '') {
      uniquePermissions.push($(evt.target).parent().siblings().find('input').val());
      $('.select-permissions form').append('<div class="form-check available-permissions"><input type="checkbox" class="form-check-input" value="'+$('#newPermission').val()+'" />'+
            '<label class="form-check-label"> '+$(evt.target).parent().siblings().find('input').val()+' </label></div>');
      $(evt.target).parent().siblings().find('input').val('');
    }
  }

  $(document).on('click', '.create-permission', (evt) => {
    addPermissions(evt);
  })
 
  $('#add_app_role').on('click', () => {    
    let selectedApps = [];
    selectedApps.push({'id':'', 'name': $('#role').val(), 'permissions': []});
    rolesTable.rows.add(selectedApps);
    rolesTable.draw();
    $('#role').val('');

    
  })  

  $("#app_roles_tbl tbody").on('click', ".delete_permission", (evt) => {        
    $( "#delete-role-confirm" ).dialog({
      resizable: false,
      height: "auto",
      width: 400,
      modal: false,
      stack: true,
      buttons: {
        "Yes": function() {
          var data = appTable.row($(evt.target).parents('tr')).data();
          rolesTable
            .row( $(evt.target).parents('tr') )
            .remove()
            .draw();  
          $( this ).dialog( "close" );  
        },
        No: function() {
          $( this ).dialog( "close" );
        }
      }
    });    
    $('.ui-dialog').css('z-index',1200);
    
  })    

  //Create Applications
  $('#create_app').on('click', () => {
    //console.log('create-app clicked');
    let postData = {
      "id": $('#appId').val(),
      "name": $('#appName').val(),
      "description": $('#description').val(),
      "email": $('#email').val(),
      "owner": $('#owner').val(),      
    };

    let rolesPermissions = [];
    rolesTable.rows().every(function (index, element) {
      let role = {}, permissions=[];
      var data = this.data(); 
      role.name = data.name;
      
      var node = this.node();
      let checkboxes = $(node).find("input:checkbox");
      for (var j=0; j<checkboxes.length; j++) {
        //console.log($(checkboxes[j]).prop("checked"));
        if($(checkboxes[j]).prop("checked")) {
          permissions.push({"name":$(checkboxes[j]).attr('value')})
        }
      }
      role.permissions = permissions;
      rolesPermissions.push(role);
    });


    postData.roles = rolesPermissions;

    //console.log(JSON.stringify(postData));

    fetch('/application', {
      method: ($('#appId').val() != '') ? 'PUT' : 'POST',
      body: JSON.stringify(postData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((application) => {
      //console.log('success');
      $('#create-app-modal').modal('hide');
      $('#applications_tbl').DataTable().ajax.reload();
    });
  }) 

  let getApplicationDetails = (applicationId) => {
    uniquePermissions = [];
    rolesTable.clear().draw();
    let availablePermissions = [];
    fetch('/application?id='+applicationId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((application) => {
      $('#appId').val(application.id);
      $('#appName').val(application.name);
      $('#description').val(application.description);
      $('#email').val(application.email);
      $('#owner').val(application.owner);

      let selectedPermission = [];

      let selectedRoles=[];
      application.Roles.forEach((role) => {
        selectedPermission.push({'name': role.name, 'id': role.id, 'permissions':role.Permissions});      
        role.Permissions.forEach((permission) => {
          availablePermissions.push(permission.name);          
        })
      })
      uniquePermissions = [...new Set(availablePermissions)];
      $('#create-app-modal').modal({modal:false});

      rolesTable.rows.add(selectedPermission);
      rolesTable.draw();    
  });
}

});

