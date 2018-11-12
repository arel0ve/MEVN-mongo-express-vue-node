<template>
  <div class="container">
    <div class="row border-bottom" v-if="$route.path.includes('edit')">
      <div class="col-8">
        <h4>Editing user's login:</h4>
      </div>
      <div class="col-4">
        <h4>{{ $route.params.login }}</h4>
      </div>
    </div>
    <div class="row" v-else>
      <div class="col">Creating new user</div>
    </div>
    <form id="users-data">
      <div class="form-group" v-if="$route.path.includes('create')">
        <label for="inputLogin">Login</label>
        <input type="text" class="form-control" id="inputLogin" name="login"
               placeholder="Enter login" required v-model="user.login">
      </div>
      <div class="form-group">
        <label for="inputEmail">Email address</label>
        <input type="email" class="form-control" id="inputEmail" aria-describedby="emailHelp" name="email"
               :placeholder="placeholders.email" required v-model="user.email">
        <small id="emailHelp" class="form-text text-muted">Please input your email above.</small>
      </div>
      <div class="form-group">
        <label for="inputPassword">Your current password</label>
        <input type="password" class="form-control" id="inputPassword" aria-describedby="passwordHelp" name="password"
               placeholder="Enter password" required v-model="user.password">
        <small id="passwordHelp" class="form-text text-muted">Please input current password of your account.</small>
      </div>
      <div class="form-group">
        <label for="inputFirstName">First Name</label>
        <input type="text" class="form-control" id="inputFirstName" name="firstName"
               :placeholder="placeholders.firstName" v-model="user.firstName">
      </div>
      <div class="form-group">
        <label for="inputLastName">Last Name</label>
        <input type="text" class="form-control" id="inputLastName" name="lastName"
               :placeholder="placeholders.lastName" v-model="user.lastName">
      </div>
      <div class="form-group">
        <label for="inputCountry">Country</label>
        <input type="text" class="form-control" id="inputCountry" name="country"
               :placeholder="placeholders.country" v-model="user.country">
      </div>
      <div class="row alert" :class="{ 'alert-success': response.isGood, 'alert-danger': !response.isGood }"
           v-if="response.message.length > 0">
        <div class="col">{{ response.message }}</div>
      </div>
      <div class="row border-top border-info" style="padding: 12px 0;">
        <div class="col-6">
          <button class="btn btn-primary" v-if="$route.path.includes('edit')" @click.prevent="updateUser">Edit</button>
          <button class="btn btn-primary" v-else @click.prevent="createUser">Create</button>
        </div>
        <div class="col-6">
          <button class="btn btn-secondary" @click.prevent="goBack">
            <span>Back</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: "UserEdit",
  data() {
    return {
      user: {},
      response: {
        message: '',
        isGood: false
      },
      placeholders: {
        email: 'Enter email',
        firstName: 'Enter first name',
        lastName: 'Enter last name',
        country: 'Enter country'
      }
    }
  },
  created() {
    if (this.$route.path.includes('edit')) {
      this.$store.dispatch('getUser', {login: this.$route.params.login})
          .then(user => this._replacePlaceholders(user));
    }
  },
  methods: {
    _replacePlaceholders(user = this.user) {
      let self = this;
      let replace = function(key, u = this.user) {
        if (u[key] && u[key] !== '') {
          self.placeholders[key] = u[key];
        }
      };
      replace('email', user);
      replace('firstName', user);
      replace('lastName', user);
      replace('country', user);
    },
    updateUser() {
      this.$store.dispatch('updateUser', {login: this.$route.params.login, updatedUser: this.user})
          .then(() => {
            this.response.isGood = true;
            this.response.message = 'Updating successful';
          })
          .catch((errCode) => {
            this.response.isGood = false;
            switch(errCode) {
              case '400':
                this.response.message = 'Empty data fields. ' +
                    'Please, input it and try again';
                break;
              case '404':
                this.response.message = 'User not found';
                break;
              case '403':
                this.response.message = 'Password is wrong';
                break;
              default:
                this.response.message = 'Something was bad in updating! Please try again later';
                break;
            }
          });
    },
    createUser() {
      this.$store.dispatch('createUser', {login: this.user.login, newUser: this.user})
          .then(() => {
            this.response.isGood = true;
            this.response.message = 'Creating successful';
          })
          .catch(errCode => {
            this.response.isGood = false;
            switch(errCode) {
              case '400':
                this.response.message = 'Empty data fields. ' +
                    'Please, input it and try again';
                break;
              case '404':
                this.response.message = 'This login is existing. ' +
                    'Please, change login and try again';
                break;
              default:
                this.response.message = 'Something was bad in creating! Please try again later';
                break;
            }
          });
    },
    goBack() {
      this.$router.push('../index');
    },
  }
}
</script>

<style scoped>
.form-group {
  text-align: left!important;
}
</style>
