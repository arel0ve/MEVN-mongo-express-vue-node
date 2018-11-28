<template>
  <div class="container">
    <div class="row">
      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="selectfriends">Message to:</label>
        </div>
        <select class="custom-select" id="selectfriends" v-model="toFriend" @change="onSelectInterlocutor">
          <option v-for="friend of friends" :value="friend.login">{{friend.login}}</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="input-group mb-3">
        <div class="input-group-prepend">
          <label class="input-group-text" for="dialogs">Previous dialogs:</label>
        </div>
        <div id="dialogs" class="dialogs">
          <div v-for="msg of messages"
               :class="{ 'msg-input': msg.type === 'in', 'msg-output': msg.type === 'out' }">
            <span class="msg">
              {{ msg.text }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">Message:</span>
        </div>
        <textarea class="form-control" aria-label="With textarea" v-model="message"></textarea>
      </div>
    </div>
    <div class="row alert"
         :class="{ 'alert-success': response.isGood, 'alert-danger': !response.isGood }"
         v-if="response.message.length > 0">
      <div class="col">{{ response.message }}</div>
    </div>
    <div class="row justify-content-center" style="margin-top: 1rem;">
      <button class="btn btn-primary" @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Write",
  data() {
    return {
      friends: [],
      toFriend: '',
      message: '',
      messages: [],
      response: {
        message: '',
        isGood: false,
      },
      ws: null,
    };
  },
  async created() {
    this.ws = new WebSocket('ws://localhost:40510');
    this.friends = await this.$store.dispatch('getFriendsByLogin', { login: this.$route.params['login'] });
  },
  destroyed() {
    this.ws.close();
  },
  methods: {
    async sendMessage() {
      try {

        if (!this.toFriend || !this.message) {
          this.response.isGood = false;
          this.response.message = `Write something to send and choose the receiver`;
          return;
        }

        this.ws.send(JSON.stringify({
          from: this.$route.params['login'],
          to: this.toFriend,
          message: this.message
        }));

        this.ws.onmessage = (res) => {
          res = JSON.parse(res.data);
          // this.response.isGood = res.type === 'msg-send-ok';
          // this.response.message = res.type === 'msg-send-ok' ? 'Ok!' : res.message;
          this.messages.push({
            interlocutor: res.to,
            text: res.message,
            type: 'out',
            when: res.when
          });
          this.message = '';
          this.$store.commit('addMessages', {
            login: res.from,
            messages: [{
              interlocutor: res.to,
              text: res.message,
              type: 'out',
              when: res.when
            }],
          });
          this.$store.commit('addMessages', {
            login: res.to,
            messages: [{
              interlocutor: res.from,
              text: res.message,
              type: 'in',
              when: res.when
            }],
          });
        };

      } catch (e) {
        this.response.isGood = false;
        this.response.message = `We can not send you message because of ${e.message}`;
      }
    },
    async onSelectInterlocutor() {
      this.messages = await this.$store.dispatch('getUsersMessagesWithInterlocutor', {
        login: this.$route.params['login'],
        interlocutor: this.toFriend
      });
    }
  }
}
</script>

<style scoped>
.input-group-text {
  min-width: 150px;
}
.dialogs {
  height: calc(100vh - 300px);
  overflow-y: auto;
  width: calc(100% - 150px);
  padding: 12px;
}
.msg {
  background: #cfe3fe;
  padding: 12px;
  border-radius: 6px;
  margin: 6px;
}
.msg-input {
  text-align: left;
  margin: 18px 0;
}
.msg-output {
  text-align: right;
  margin: 18px 0;
}
</style>
