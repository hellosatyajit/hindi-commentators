import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import * as React from 'react'
import { DefaultCatchBoundary } from '../components/DefaultCatchBoundary'
import { NotFound } from '../components/NotFound'
import appCss from '../styles/app.css?url'
import { seo } from '../utils/seo'
import { getSupabaseServerClient } from '../utils/supabase'
import { Toaster } from 'react-hot-toast'
import { Login } from '~/components/Login'

// @ts-ignore
const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const supabase = await getSupabaseServerClient()
  const { data, error: _error } = await supabase.auth.getUser()

  if (!data.user?.email) {
    return null
  }

  return data.user
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title:
          'Hindi Commentary, vote worst from the worst',
        description: `Platform for cricket fans to show how bad hindi commentary is.`,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  beforeLoad: async () => {
    const user = await fetchUser()

    return {
      user,
    }
  },
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { user } = Route.useRouteContext()

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <header className="px-4 py-8 flex gap-2 text-lg">
          <nav className='max-w-4xl sm:mx-auto flex flex-col sm:flex-row gap-5
          '>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-800">
              Hindi Commentary,
              <br />
              vote worst from the worst
            </h1>
            <div className="sm:ml-auto">
              {user ? (
                <>
                  <span className="mr-2">{user.user_metadata.name}</span>
                  
                </>
              ) : (
                <Login />
              )}
            </div>
          </nav>
        </header>
        <hr />
        {children}

        <div className="fixed bottom-0 right-0 mt-8 p-2 leading-none rounded-tl-lg text-gray-500 bg-white w-fit">
          By <a href="https://satyajit.xyz">Satyajit</a> & <a href="https://www.linkedin.com/in/jaybhattwrites">Jay</a>
        </div>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
