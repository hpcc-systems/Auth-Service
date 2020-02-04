$(document).ready(() => {

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
                "role" : (element.Roles[0] != null ? element.Roles[0].name  : ""),
                "roleId" : (element.Roles[0] != null ? element.Roles[0].id  : ""),
                "permissions": (element.Roles[0] != null ? element.Roles[0].User_Roles.permissions  : "")
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
      { title: "Role", data: "role", width:'240px' },
      { title: "RoleId", data: "roleId", width:'240px', visible: false },
      { title: "Permissions", data: "permissions", width:'240px', visible: false },
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

  //datatable actions
  $('#user_tbl').on('click', 'td', function () {
    var cell = dt.cell( this );
    var data = dt.row( $(this).parents('tr') ).data();
    //edit
    if(cell.index().column == 9) {
      $('#inputFirstName').val(data["firstName"]);
      $('#inputLastName').val(data["lastName"]);
      $('#inputEmail').val(data["email"]);
      $('#inputOrganization').val(data["organization"]);
      $('#inputUserName').val(data["username"]);

      fillRoles(data["roleId"]);
      console.log(data["permissions"]);
      loadPermissions(data["permissions"]);

      $('#create-usr-model #create_user').html('Update User');

      $('#create-usr-model').modal()
    }

    //delete
    if(cell.index().column == 10) {
      $('#confirm-delete #userIdToDelete').val(data["id"]);
      $('#confirm-delete').modal();
    }

    //change password
    if(cell.index().column == 11) {
      $('#chg-pwd-model #username').val(data["username"]);
      $('#chg-pwd-model').modal();
    }

  });

  //Add User button
  $('.add-user-btn').on('click', () => {
    fillRoles();
    loadPermissions();

    $('#create-usr-model #create_user').html('Create User');

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
    $.post("/users/user",
    {
      "firstName": $('#inputFirstName').val(),
      "lastName": $('#inputLastName').val(),
      "email": $('#inputEmail').val(),
      "organization": $('#inputOrganization').val(),
      "username": $('#inputUserName').val(),
      "password": $('#inputPassword').val(),
      "role": $('#inputRole').val(),
      "permissions": $('#permissions').val().join(',')
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

});

function fillRoles(selectedValue) {
  $.get("/users/roles", function( data ) {
    var roles = $("#inputRole");
    roles.empty();
    roles.append($("<option />").val('').text('Choose...'));
    $.each(data, function() {
        roles.append($("<option />").val(this.id).text(this.name));
    });
    if(selectedValue) {
      roles.val(selectedValue);
    }
  });
}

function loadPermissions(selectedValue) {
  $.get("/users/permissions", function( data ) {
    var permissions = $("#permissions");
    permissions.empty();
    $.each(data, function() {
        permissions.append($("<option />").val(this.id).text(this.name));
    });
    permissions.val(selectedValue.split(','));
  });
}


