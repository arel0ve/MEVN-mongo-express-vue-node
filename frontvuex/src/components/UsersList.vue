<template>
  <div class="container">
      <div class="row" v-for="user of users">
        <div class="col-4">
          <router-link :to="'user/' + user.login">{{ user.login }}</router-link>
        </div>
        <div class="col-2">
          <router-link :to="'write/' + user.login">&#128390;</router-link>
        </div>
        <div class="col-2">
          <button type="button" class="btn messages"
                  :class="{ 'btn-light': !user.inputMessages.length, 'btn-info': user.inputMessages.length}"
                  :title="user.inputMessages.length ? user.inputMessages[user.inputMessages.length - 1].text : 'no messages'"
                  style="padding: 0">
            <span>&#128172;</span>
            <sup>{{user.inputMessages.length }}</sup>
          </button>
        </div>
        <div class="col-2">
          <router-link :to="'edit/' + user.login">edit</router-link>
        </div>
        <div class="col-2">
          <span class="delete" @click="deleteUser(user.login)">X</span>
        </div>
      </div>
    <div class="row justify-content-center border-top border-info">
      <div class="col-6 col-md-4" v-if="existsMoreUsers" style="padding: 12px 0;">
        <button class="btn btn-primary col-10" @click="getMoreUsers">Show more users</button>
      </div>
      <div class="col-6 col-md-4" style="padding: 12px 0;">
        <button class="btn btn-primary col-10" @click="reload">Reload</button>
      </div>
      <div class="col-6 col-md-4" style="padding: 12px 0;">
        <router-link to="../create">
          <button class="btn btn-primary col-10">Create new user</button>
        </router-link>
      </div>
    </div>
    <div class="row alert alert-danger" v-if="errMessage.length > 0">
      <div class="col">{{ errMessage }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UsersList',
  data() {
    return {
      users: [],
      existsMoreUsers: true,
      errMessage: '',
      ws: null,
    }
  },
  async created() {
    this.users = await this.$store.dispatch('getUsers');
    if (this.users.length === 0) {
      this.errMessage = 'There are not any users in user\'s list. Please, try again later';
    }

    this.ws = new WebSocket('ws://localhost:40510');
    this.ws.onmessage = (ev) => {
      const message = JSON.parse(ev.data);
      if (message.type === 'msg-send-ok') {
        const user = _.find(this.users, { login: message.to });
        if (!user) {
          return;
        }
        user.inputMessages.push({ text: message.message });
      }
    };
  },
  destroyed() {
    this.ws.close();
  },
  methods: {
    async getMoreUsers() {
      const oldLength = this.users.length;
      this.users = await this.$store.dispatch('getMoreUsers', {});
      if (this.users.length === oldLength) {
        this.existsMoreUsers = false;
      }
    },
    async reload() {
      this.users = await this.$store.dispatch('reload', {});
      if (this.users.length === 0) {
        this.errMessage = 'There are not any users in user\'s list. Please, try again later';
      }
    },
    async deleteUser(login) {
      const res = await this.$store.dispatch('deleteUser', { login });
      if (typeof res === 'object' && res !== null) {
        this.users = res;
        if (this.users.length === 0) {
          this.errMessage = 'There are not any users in user\'s list. Please, try again later';
        }
      } else {
        this.errMessage = 'Something bad on server. Please, try again later';
      }
      await this.reload();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  margin: 0 10px;
}
a {
  color: #42b983;
  &:hover {
    color: #4283b9;
  }
}
.delete {
  cursor: pointer;
  color: #b94283;
  &:hover {
    color: #4283b9;
    text-decoration: underline;
  }
}
</style>
