$(document).ready(() => {
   let $selectedRole, $selectedApplicationId, $rolespermissions={}; 
   $( "#saveSuccess" ).dialog({
      autoOpen: false,
      modal: true,
      buttons: {
        Ok: function() {
          $( this ).dialog( "close" );
        }
      }
    });

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
      { title: "Name",  width:'400px',
        render: (data, type, full, meta) => {
          return '<a data-toggle="tab" class="appdetails" href="#roles-info">'+full.name+'</a>';
        }
      },
      { title: "Description", data:"description", width:'400px' },
      { title: "Contact Email", data:"email", width:'400px' },
      { title: "Owner", data:"owner", width:'440px' },
      { title: "", data: "", width:'30px',
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
    getApplicationDetails2(data[Object.keys(data)[0]]);    
  })  

  $("#applications_tbl tbody").on('click', ".appdetails", (evt) => {    
    var data = appTable.row($(evt.target).parents('tr')).data();
    $selectedApplicationId = data[Object.keys(data)[0]];
    getApplicationDetails($selectedApplicationId);
    $('.appdetails').removeClass('active');    
    $('#application-nav').trigger('click');
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

  //Roles tab
  $('#roles_tbl').on('init.dt', () => {
    $('.new-role-btn') 
     .attr('data-toggle', 'collapse')
     .attr('data-target', '#new-role');  
  })

  let applicationPermissions = [], unqiuePermissionTypes =[];
  let rolesTable = $('#roles_tbl').DataTable( {
    "paging": false,
    "info": false,
    "searching": true,
    "autoWidth": false,
    "scrollY":        "400px",
    "scrollCollapse": true,
    dom: 'Bfrtip',
    buttons: [{
       text: 'New Role',
       className: 'btn btn-outline new-role-btn'
    }],
    data: applicationPermissions,
    columns: [
      { title: "Name", width:'200px',
        render: (data, type, full, meta) => {
          return '<a data-toggle="tab" class="roledetails" href="#nav-permissions">'+full.name+'</a>';
        }
      },     
      { title: "Description", data: "description", width:'400px'}, 
      { title: "", data: "", width:'50px',
        render: function ( data, type, full, meta ) {
          return '<span class="delete_role"><i class="fa fa-times-circle"></i></span>';
        }
      }
    ]
    
  });  
  $( rolesTable.table().container() ).removeClass( 'form-inline' );  

  $("#roles_tbl tbody").on('click', ".roledetails", (evt) => {   
    //role data
    var data = rolesTable.row($(evt.target).parents('tr')).data();
    populatePermissions(data);
    $('.roledetails').removeClass('active');        
    //trigger tab click
    $('#application-permission').trigger('click');
    $('#application-role').addClass('active');

    $('.select-permissions').on('change', '.form-check-input', (evt) => {
      accessTypeSelected($(evt.target));
    })

    $('.permission-select').on('change', '', (evt) => {
      updatePermissions();
    })

    $('.back-role-btn').on('click', () => {
    $('.back-role-btn').removeClass('active');
    })
  }) 

  

  var accessTypeSelected = (formcheckInput) => {
    //check/uncheck the .permission-select checkboxes based on accessType checkbox selection
    if($(formcheckInput).prop('checked') || $(formcheckInput).closest('div').siblings('.available-permissions').children('input[type="checkbox"].form-check-input:checked').length > 0) {
      $(formcheckInput).closest('td').siblings('.dt-body-center').children('.permission-select').prop('checked', true);
    } else {
      $(formcheckInput).closest('td').siblings('.dt-body-center').children('.permission-select').prop('checked', false)
    }
    updatePermissions();
  }

  $('#permissions_tbl').on('init.dt', () => {
    $('.back-role-btn') 
     .attr('data-toggle', 'pill')
     .attr('data-target', '#nav-role');  
  })

  let permissionsTable = $('#permissions_tbl').DataTable( {
    "paging": false,
    "info": false,    
    "searching": true,
    "autoWidth": false,
    scrollY: '50vh',
    "scrollCollapse": true,
    data: applicationPermissions,
    dom: 'Bfrtip',
    buttons: [{
       text: 'Back to Roles',
       className: 'btn btn-outline back-role-btn'
    }],
    columnDefs: [{
        targets: 0,
        data: 2,
        'checkboxes': {
            'selectRow': true
        }
    },
    ],
    select: {
        style: 'multi'
    },
    order: [[1, 'asc']],
    columns: [
      {
       'width':'5px',
       'targets': 0,
       'searchable': false,
       'orderable': false,
       'className': 'dt-body-center',
       'checkboxes': {
            'selectRow': true
        },
       'name': 'selected',
       render: function (data, type, full, meta){
           return '<input type="checkbox" class="permission-select" value="' + $('<div/>').text(data).html() + '">';
        }
      },
      { title: "Name", data:"name", width:'300px' },     
      { title: "Description", data: "description", width:'200px'}, 
      { title: "Access Type", data: "access", 'width':'200px', 
        render: function(data, type, full, meta) {
          let accessTypes = full.access ? full.access.split(',') : [];
          let renderHtml = '<div class="dropdown">'+
            '<button class="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
              'Permissions'+
            '</button>'+
            '<div class="dropdown-menu select-permissions">'+
              '<form class="px-4 py-3">';
              accessTypes.forEach((permission) => { 
                //let checked = ($.grep($selectedRole.permissions, function(n) { return n.name == permission })).length > 0 ? 'checked' : ''; 
                renderHtml += '<div class="form-check available-permissions">' +                               
                  '<input type="checkbox" class="form-check-input" value="'+permission+'" >'+
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
      }
    ]
  });  
  $( permissionsTable.table().container() ).removeClass( 'form-inline' );  

  let populatePermissions = (data) => {
    //var data = rolesTable.row($(evt.target).parents('tr')).data();
    $selectedRole = data;
    console.log($selectedRole);
    $('.role_name_heading').html('Permissions for '+data.name);
    //clear all checkboxes in permissions page
    $('#permissions_tbl_wrapper input[type="checkbox"].permission-select').prop('checked', false);
    //pre-select permissions already selected for this role
    if($selectedRole && $selectedRole.permissions) {
      $('#permissions_tbl_wrapper input[type="checkbox"].permission-select').each(function() {
        let permissionName = $(this).closest('td').next('td').text();
        let selectedPermissions = JSON.parse($selectedRole.permissions);
        //checkobx in first column
        let permissionforCurrentRow = selectedPermissions.filter(permission => permission.name == permissionName);
        if(permissionforCurrentRow.length > 0) {        
          $(this).prop('checked', true);
          //accessType checkboxes
          let defaultAccessTypeCheckboxes = $(this).closest('td').siblings().eq(2).find('input[type="checkbox"]');
          defaultAccessTypeCheckboxes.each(function( index ) {
            if(permissionforCurrentRow[0].accessType && permissionforCurrentRow[0].accessType != '') {            
              if(permissionforCurrentRow[0].accessType.indexOf($(this).val()) != -1) {
                $(this).prop('checked', true);
              }            
            }              
          });
          //check if there is a custom access type added for this Permission
          if(defaultAccessTypeCheckboxes.length == 0 && permissionforCurrentRow[0].accessType != '') {
            console.log(permissionforCurrentRow[0].accessType)
            if(permissionforCurrentRow[0].accessType) {
              let customAccessTypes = permissionforCurrentRow[0].accessType.split(',');
              customAccessTypes.forEach((customAccessType) => {
                let customAccessTypeCheckbox = '<div class="form-check available-permissions">' +                               
                    '<input type="checkbox" checked class="form-check-input" value="'+customAccessType+'" >'+
                    '<label class="form-check-label" >'+
                      customAccessType +
                    '</label>'+
                  '</div>';        
                $(this).closest('td').siblings().eq(2).find('.select-permissions form').append(customAccessTypeCheckbox);  
              });
            }
          }
        }
      })
    }
  }

  $('#application-nav').on('click', () => {    
    $('#application-role').removeClass('active');
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

  $('a[data-toggle="pill"]').on('shown.bs.tab', function(e){   
   $($.fn.dataTable.tables(true)).DataTable()
      .columns.adjust();
  });  

  let getApplicationDetails = (applicationId) => {
    console.log('getApplicationDEtails...')
    let availableRoles = [], availablePermissions = [], permissionTypes = [];
    fetch('/application/details?id='+applicationId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((response) => {
      let application = response.application;
      rolesTable.clear().draw();
      permissionsTable.clear().draw();
      //$('#appId').val(application.id);
      $('.appname').html(application.name);
      $('.appdesc').html(application.description);
      $('#appName').val(application.name);
      $('#appDescription').val(application.description);
      $('#appEmail').val(application.email);
      $('#appOwner').val(application.owner);

      application.Roles.forEach((role) => {
        availableRoles.push({'name': role.name, 'id': role.id, 'description':role.description, 'permissions':role.permissions});      
      })
      rolesTable.rows.add(availableRoles);
      rolesTable.draw();        

      if(response.permissions) {
        let permissions = response.permissions;
        permissions.forEach((permission) => {
          availablePermissions.push({
            'id': permission.id,
            'applicationType': permission.applicationType,
            'name': permission.name,
            'access': permission.access,
            'description': permission.description
          })          

        })        
        permissionsTable.rows.add(availablePermissions);
        permissionsTable.draw();        
        console.log($selectedRole)    
        if($selectedRole && $selectedRole != undefined) {          
          let currentlyEditingRole = application.Roles.filter(role => role.id == $selectedRole.id)
          populatePermissions(currentlyEditingRole[0]);
        }
      }
      //pre-populate unique permission types
      /*uniquePermissions.forEach((permissionType) => {
        $('.select-permissions').append('<div class="available-permissions"><input type="checkbox" class="form-check-input" value="'+permissionType+'" />'+
            '<label class="form-check-label">'+permissionType+'</label></div>');
      })*/

    })
  }
  //Add New Role button
  $('.add-new-role').on('click', () => {
    fetch('/application/app-permissions?type='+$('#appType').val(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then((response) => {
      let permissions = response, availablePermissions = [];
      permissions.forEach((permission) => {
        availablePermissions.push({
          'id': permission.id,
          'applicationType': permission.applicationType,
          'name': permission.name,
          'access': permission.access,
          'description': permission.description
        })          

      })        
      permissionsTable.rows.add(availablePermissions);
      permissionsTable.draw();
      
      let newRole = [];
      newRole.push({'id':'', 'name': $('#roleName').val(), 'description': $('#roleDescription').val()});
      rolesTable.rows.add(newRole);
      rolesTable.draw();    

      $('#roleName').val('');  
      $('#roleDescription').val('');  

      })
  });  
  
  //Add New Permission button
  $('.add-new-permission').on('click', () => {
    let selectedPermissionTypes=[];
    let checkboxes = $('.select-permissions').find("input:checkbox");
    for (var j=0; j<checkboxes.length; j++) {
      if($(checkboxes[j]).prop("checked")) {
        selectedPermissionTypes.push($(checkboxes[j]).attr('value'))
      }
    }

    let newPermission = [];
    newPermission.push({
      'id':'', 
      'name': $('#permissionName').val(), 
      'description': $('#permissionDescription').val()
    });
    permissionsTable.rows.add(newPermission);
    permissionsTable.draw();
    $('#permissionName').val('');  
    $('#permissionDescription').val('');  
  });  

  //Create button click on Permissions
  $(document).on('click', '.create-permission', (evt) => {
    addPermissionType(evt);
  })

  let addPermissionType = (evt) => {
    let uniquePermissions=[];
    const barrerdChars = ["<", ">", "/"];

    evt.preventDefault();
    evt.stopPropagation();
    if($(evt.target).parent().siblings().find('input').val() != '') {
      const permissionType = $(evt.target).parent().siblings().find("input").val();
      const permissionTypeArr = permissionType.split("");
      const filterdPermissionTypeArr = permissionTypeArr.filter((char) => !barrerdChars.includes(char)); // Strip off any char that could be used for js injectio
      const newPermissionType = filterdPermissionTypeArr.join("");

      uniquePermissions.push(newPermissionType);
      $('.select-permissions').append('<div class="available-permissions"><input type="checkbox" class="form-check-input" value="'+newPermissionType+'" />'+
            '<label class="form-check-label">'+newPermissionType+'</label></div>');

      $(evt.target).parent().siblings().find('input').val('');
    }
   }

   let updatePermissions = () => {
      console.log($selectedRole);
      let checkedPermissions = [];
      if($selectedRole) {
        $('#permissions_tbl_wrapper input[type="checkbox"].permission-select:checked').each(function() {
          let permission = {}, accessType=[];
          permission.name = $(this).closest('td').next('td').text();
          $(this).closest('td').siblings().eq(2).find('input[type="checkbox"]:checked').each(function( index ) {
            accessType.push($(this).val())
          });
          
          permission.accessType = accessType.join(',');
          checkedPermissions.push(permission);
        });
        $rolespermissions[$selectedRole.name] = {name: $selectedRole.name, id: $selectedRole.id, permissions: checkedPermissions}
      }
      console.log($rolespermissions)
   }

   $('#save-application').on('click', () => {
      let checkedPermissions = [];
      let application = {
       'id': $selectedApplicationId != undefined ? $selectedApplicationId : '',
       'name': $('#appName').val(),
       'description': $('#appDescription').val(),
       'email': $('#appEmail').val(),
       'owner': $('#appOwner').val(),
       'applicationType': $('#appType').val()
       //'role': $selectedRole
      }
      
      let roles = [];
      Object.keys($rolespermissions).forEach((rolesPermission) => {
        roles.push($rolespermissions[rolesPermission])
      })
      application.roles = roles;
      fetch('/application', {
        method: (application.id != '') ? 'PUT' : 'POST',
        body: JSON.stringify(application),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then((application) => {
        $( "#saveSuccess" ).dialog("open");
        getApplicationDetails($selectedApplicationId)
      });
      console.log(application)      
    });
});

