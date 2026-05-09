import * as Linking from 'expo-linking'

const prefix = Linking.createURL('/')

export const linking = {
  prefixes: [prefix, 'https://oqens.app', 'http://oqens.app', 'oqens://'],
  config: {
    screens: {
      Main: {
        screens: {
          FeedStack: {
            screens: {
              Feed: '',
              PostDetail: 'posts/:postId',
            },
          },
          ExploreStack: {
            screens: {
              Explore: 'explore',
              SearchResults: 'search',
              TagFeed: 'tags/:tag',
            },
          },
          ProfileStack: {
            screens: {
              Profile: 'profile',
              UserProfile: 'users/:username',
              Followers: 'users/:username/followers',
              Following: 'users/:username/following',
              EditProfile: 'profile/edit',
            },
          },
          Messages: {
            screens: {
              Inbox: 'messages',
              Chat: 'messages/:threadId',
            },
          },
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          VerifyEmail: 'verify-email',
        },
      },
    },
  },
}
