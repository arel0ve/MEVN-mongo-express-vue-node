import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    users: [],
    from: 0,
    count: 5,
  },
  mutations: {
    addUser(state, newUser) {
      if (!newUser.messages) {
        newUser.messages = [];
      }
      state.users.push(newUser);
    },
    changeUser(state, { login, newUser }) {
      const i = _.findIndex(state.users, { login });
      state.users[i].login = login ? login : state.users[i].login;
      state.users[i].email = newUser.email ? newUser.email : state.users[i].email;
      state.users[i].fristName = newUser.firstName ? newUser.firstName : state.users[i].firstName;
      state.users[i].lastName = newUser.lastName ? newUser.lastName : state.users[i].lastName;
      state.users[i].birthday = newUser.birthday ? newUser.birthday : state.users[i].birthday;
      state.users[i].country = newUser.country ? newUser.country : state.users[i].country;
      state.users[i].country = newUser.country ? newUser.country : state.users[i].country;
      state.users[i].friends = newUser.friends ? newUser.friends : state.users[i].friends;
      state.users[i].messages = newUser.messages ? newUser.messages : state.users[i].messages;
    },
    deleteUser(state, { login }) {
      _.pullAllBy(state.users, [{ login }], 'login');
    },
    nextStepLoadMore(state) {
      state.from += state.count;
    },
    addMessages(state, { login, messages }) {
      const user = _.find(state.users, { login });
      if (user) {
        messages.forEach(message => {
          user.messages.push(message);
        })
      }
    }
  },
  actions: {
    async getUsers(context) {
      if (context.state.users.length) {
        return context.state.users;
      }
      return await context.dispatch('getMoreUsers', {});
    },
    async getUsersMessagesWithInterlocutor(context, { login, interlocutor }) {
      try {
        let user = _.find(context.state.users, { login });
        if (!user) {
          user = await context.dispatch('getUser', { login });
        }
        if (user.messages.length > 0) {
          const messages = _.filter(user.messages, { interlocutor });
          if (messages.length > 0) {
            return messages;
          }
        }
        const res = await fetch(`http://localhost:3000/api/messages/${login}?interlocutor=${interlocutor}`);
        let messages = await res.json();
        messages = Array.isArray(messages) ? messages : [];
        context.commit('addMessages', {login, messages});
        return messages;
      } catch(e) {
        console.log(e);
        return [];
      }
    },
    async getUsersByCountry(context, { country }) {
      try {
        const res = await fetch(`http://localhost:3000/api/users/by-country?country=${country}`);
        return await res.json();
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    async getFriendsByLogin(context, { login }) {
      try {
        const res = await fetch(`http://localhost:3000/api/users/friends?login=${login}`);
        const user = await res.json();
        return user.friends;
      } catch (e) {
        console.error(e);
        return [];
      }
    },
    async reload(context) {
      context.state.users = [];
      return await context.dispatch('getMoreUsers', {
        from: 0,
        to: context.state.from,
        isReload: true,
      });
    },
    async getMoreUsers(context, { from, to, isReload }) {
      try {
        from = (from !== undefined) ? from : context.state.from;
        to = to ? to : (context.state.count + from);
        isReload = !!isReload;
        const res = await fetch(`http://localhost:3000/api/users?from=${from}&to=${to}`);
        const users = await res.json();
        for (const user of users) {
          if (!_.find([], { login: user.login })) {
            context.commit('addUser', user);
          }
        }
        if (users.length > 0 && !isReload) {
          context.commit('nextStepLoadMore');
        }
        return context.state.users;
      } catch (e) {
        console.error(e);
        return context.state.users ? context.state.users : [];
      }
    },
    async getUser(context, { login }) {
      try {
        const storeUser = _.find(context.state.users, { login });
        if (storeUser && storeUser.email) {
          return storeUser;
        }
        const res = await fetch(`http://localhost:3000/api/user/${login}`);
        const user = await res.json();
        if (storeUser) {
          context.commit('changeUser', { login, newUser: user });
        } else {
          context.commit('addUser', user);
        }
        return user;
      } catch (e) {
        console.error(e);
        return {
          login: 'Not Found',
        };
      }
    },
    async updateUser(context, { login, updatedUser }) {
      try {
        if (!login || !updatedUser.email || !updatedUser.password) {
          throw new Error('400');
        }
        const res = await fetch(`http://localhost:3000/api/user/${login}`, {
          method: 'put',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: JSON.stringify(updatedUser),
        });
        if (res.status !== 200) {
          throw new Error(res.status.toString());
        }
        context.commit('changeUser', { login, newUser: updatedUser });
        return '200';
      } catch (e) {
        console.error(e);
        return e.toString();
      }
    },
    async createUser(context, { login, newUser }) {
      try {
        if (!login || !newUser.email || !newUser.password) {
          throw new Error('400');
        }
        if (_.find(context.state.users, { login })) {
          throw new Error('404');
        }
        const res = await fetch('http://localhost:3000/api/user/', {
          method: 'post',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: JSON.stringify(newUser),
        });
        if (res.status !== 200) {
          throw new Error(res.status.toString());
        }
        context.commit('addUser', newUser);
        return '200';
      } catch (e) {
        console.error(e);
        return e.toString();
      }
    },
    async deleteUser(context, { login }) {
      try {
        const res = await fetch(`http://localhost:3000/api/user/${login}`, {
          method: 'delete',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        });
        const user = await res.json();
        context.commit('deleteUser', { login: user.login });
        return context.state.users;
      } catch (e) {
        return e.toString();
      }
    },
  },
});
