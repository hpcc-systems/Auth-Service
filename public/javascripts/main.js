$(document).ready(() => {
  let roles = [];
  let roleTable = $('#role_tbl').DataTable( {
    "paging":   false,
    "info":     false,
    "searching": false,
    data: roles,
    columns: [
      { title: "Application", data:"application" },
      { title: "Role", data:"role" },
      { title: "Permissions", data:"permission" },
      { title: "roleId", data:"roleId",  visible: false},
      { title: "", data: "", width:'10px',
        render: function ( data, type, full, meta ) {
          return '<span class="delete_role"><i class="fa fa-times-circle"></i></span>';
        }
      }
    ]
  });  

  isValidEntry = () => {
    let duplicates = roleTable.rows().data().filter(data => 
        (data.application == $('#inputApplication option:selected').text() && data.roleId == $('#inputRole option:selected').val()))
    return (duplicates.length > 0 ? false : true);
  }

  $(".nav-link.users").on("click", (evt) => {
    console.log('.user clicked')
  })

  $(".nav-link.roles-permissions").on("click", (evt) => {
    console.log('.roles-permissions clicked')
  })

  $("#role_tbl tbody").on("click",".delete_role", (evt) => {
    roleTable
      .row( $(evt.target).parents('tr') )
      .remove()
      .draw();
  })

  $('#add_role').on('click', () => {
    if(!isValidEntry()) {
      alert("User already has this role.")
      return false;
    }
    let selectedRole = [];      
    let permission = $('#inputApplication option:selected').data('role').filter(role => role.id == $('#inputRole option:selected').val())[0].Permissions.map(permission => permission.name).join(',');
    selectedRole.push({'application': $('#inputApplication option:selected').text(), 'role': $('#inputRole option:selected').text(), 'roleId': $('#inputRole').val(), 'permission':permission});
    roleTable.rows.add(selectedRole);
    roleTable.draw();
  })  

  var dt = $("#user_tbl").DataTable( {
    ajax: function(data, callback, settings) {
      $.ajax({
        url: '/users/all',
        method: 'get',
        dataType: "json",
        processing: true,
        success: function(result){
          var users = [];
          $(result).each(function(index, element){
            users.push({
              "id" : (element.id != null ? element.id : ""),
              "firstName" : (element.firstName != null ? element.firstName : ""),
              "lastName": (element.lastName != null ? element.lastName : ""),
              "username": (element.username != null ? element.username : ""),
              "email": (element.email != null ? element.email : ""),
              "organization" : (element.organization != null ? element.organization : ""),
              "role" : (element.Roles != null ? element.Roles  : [])
              //"permissions": (element.Roles[0] != null ? element.Roles[0].User_Roles.permissions  : "")
            });
          });
          callback({aaData:users});
        }
      });
    },
    columns: [
      { title: "ID", data: "id", visible: false  },
      { title: "First Name", data: "firstName", width:'340px'  },
      { title: "Last Name", data: "lastName", width:'340px'  },
      { title: "User Name", data: "username", width:'240px' },
      { title: "Email", data: "email", width:'240px' },
      { title: "Organization", data: "organization", width:'340px' },
      //{ title: "Role", data: "role", width:'240px' },
      //{ title: "RoleId", data: "roleId", width:'240px', visible: false },
      //{ title: "Permissions", data: "Permissions", width:'240px', visible: false },
      { title: "", data: "", width:'10px',
          render: function ( data, type, full, meta ) {
            return '<span class="edit"><i class="fa fa-pencil"></i></span>';
          }
      },
      { title: "", data: "", width:'10px',
          render: function ( data, type, full, meta ) {
            return '<span class="delete"><i class="fa fa-times-circle"></i></span>';
          }
      },
      { title: "", data: "", width:'10px',
          render: function ( data, type, full, meta ) {
            return '<span class="changepwd"><i class="fa fa-key"></i></span>';
          }
      }
    ]
  });

  $( dt.table().container() ).removeClass( 'form-inline' );    

  //datatable actions
  $('#user_tbl').on('click', 'td', function () {
    var cell = dt.cell( this );
    var data = dt.row( $(this).parents('tr') ).data();
    //edit
    if(cell.index().column == 6) {
      $('#inputFirstName').val(data["firstName"]);
      $('#inputLastName').val(data["lastName"]);
      $('#inputEmail').val(data["email"]);
      $('#inputOrganization').val(data["organization"]);
      $('#inputUserName').val(data["username"]);
      $("#inputUserName").prop('disabled', true);      

      $('#create-usr-model #create_user').html('Update User');

      $('#create-usr-model').modal();
      roleTable.clear().draw();
      roles = [];
      data["role"].forEach((role) => {
        console.log(role.name)
        roles.push({
          'application': role.Application.name,
          'role': role.name,
          'roleId': role.id,
          'permission': role.Permissions.map(permission => permission.name).join(',')
        })
      })

      roleTable.rows.add(roles);
      roleTable.draw();
      
      getApplications();          
    }

    //delete
    if(cell.index().column == 7) {
      $('#confirm-delete #userIdToDelete').val(data["id"]);
      $('#confirm-delete').modal();
    }

    //change password
    if(cell.index().column == 8) {
      $('#chg-pwd-model #username').val(data["username"]);
      $('#chg-pwd-model').modal();
    }

  });

  //Add User button
  $('.add-user-btn').on('click', () => {
    roleTable.clear().draw();

    getApplications();    

    $('#create-usr-model #create_user').html('Create User');
    $("#inputUserName").prop('disabled', false);
    $('#create-usr-model').modal();
  });

  //clear modal fields on hide
  $('#create-usr-model').on('hidden.bs.modal', function (e) {
    $(this)
      .find("input,textarea,select")
         .val('')
         .end()
      .find("input[type=checkbox], input[type=radio]")
         .prop("checked", "")
         .end();
  })

  $('#chg-pwd-model').on('hidden.bs.modal', function (e) {
    $(this)
      .find("input,textarea,select")
         .val('')
         .end()
      .find("input[type=checkbox], input[type=radio]")
         .prop("checked", "")
         .end();
  })

  $('#deleteBtn').on('click', function() {
    $.post("/users/delete",
    {
      "id": $('#userIdToDelete').val()
    },
    function(data, status){
      $('#confirm-delete').modal('hide');
      $('#user_tbl').DataTable().ajax.reload();
    });
  });

  //save user
  $('#create_user').on('click', function() {
    const roleIds = roleTable.rows().data().map(data => data.roleId);
    $.post("/users/user",
    {
      "firstName": $('#inputFirstName').val(),
      "lastName": $('#inputLastName').val(),
      "email": $('#inputEmail').val(),
      "organization": $('#inputOrganization').val(),
      "username": $('#inputUserName').val(),
      "password": $('#inputPassword').val(),
      "role": roleIds.join(','),
      "permissions": $('#permissions').val()
    },
    function(data, status){
      $('#create-usr-model').modal('hide');
      $('#user_tbl').DataTable().ajax.reload();
    });
  });

  $('#change_pwd_btn').on('click', function() {
    $.post("/users/changepwd",
    {
      "username": $('#username').val(),
      "oldpassword": $('#inputOldPwd').val(),
      "newpassword": $('#inputNewPwd').val(),
      "confirmpassword": $('#inputConfPwd').val()
    }).done(function(data) {
      $('#chg-pwd-model').modal('hide');
    }).fail(function(data) {
      alert( data.responseJSON.reason);
    })
  });

  $("#inputApplication").on('change', function(evt) {
    var end = this.value;
    //$("#permissions").empty();
    fillRoles($('#inputApplication option:selected').data('role'))
  });

  $("#inputRole").on('change', function(evt) {
    var selectedRole = this.value;
    let role = $('#inputApplication option:selected').data('role').filter(role => role.id == selectedRole)[0]; 
    //loadPermissions(role ? role.Permissions : []);
  });

});

function getApplications(selectedValue) {
  $.get("/application/all", function( data ) {
    var applications = $("#inputApplication");
    applications.empty();
    applications.append($("<option />").val('').text('Choose...'));
    $.each(data, function() {
      let optionObj = $("<option/>");
      optionObj.val(this.id);
      optionObj.text(this.name);
      optionObj.data('role', this.Roles);
      applications.append(optionObj);
    });
    if(selectedValue) {
      applications.val(selectedValue).trigger('change');
    }
  });
}

function fillRoles(data, selectedValue) {
  var roles = $("#inputRole");
  roles.empty();
  roles.append($("<option />").val('').text('Choose...'));
  $.each(data, function() {
      roles.append($("<option />").val(this.id).text(this.name));
  });
  if(selectedValue) {
    roles.val(selectedValue);
  }
}

function loadPermissions(data, selectedValue) {  
  var permissions = $("#permissions");
  permissions.empty();
  $.each(data, function() {
      permissions.append($("<option />").val(this.id).text(this.name));
  });
  //permissions.val(selectedValue.split(','));  
}


