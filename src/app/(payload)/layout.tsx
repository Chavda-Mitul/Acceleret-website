/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import { connection } from 'next/server'
import React, { Suspense } from 'react'

import { importMap } from './admin/importMap.js'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

/*
 * Payload starts up (database, schema check, timers) on the first request, and
 * that code reads the clock. With cacheComponents and partialPrefetching, Next.js
 * prerenders the admin first, so the startup ran inside a prerender and failed
 * with "Blocking Route: new Date() while prerendering" (in dev, on the first
 * admin page after the server starts). connection() makes the CMS render only
 * for a real request. Payload already wraps it in a Suspense with no fallback,
 * so no prerendered output is lost. The page and its metadata do the same.
 */
async function RequestTimeRootLayout({ children }: Args) {
  await connection()
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  )
}

const Layout = ({ children }: Args) => (
  <Suspense fallback={null}>
    <RequestTimeRootLayout>{children}</RequestTimeRootLayout>
  </Suspense>
)

export default Layout
