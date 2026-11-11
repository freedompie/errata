// @vitest-environment jsdom
import React from 'react'
import { renderToString } from 'react-dom/server'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { api } from '@/lib/api'
import { StoryWizard } from '@/components/wizard/StoryWizard'

describe('StoryWizard', () => {
  it('opens as an unstructured story conversation rather than a step form', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const html = renderToString(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(StoryWizard, {
          storyId: 'story-test',
          onComplete: () => undefined,
        }),
      ),
    )

    expect(html).toContain('Shape your story')
    expect(html).toContain('Tell Errata whatever you have')
    expect(html).toContain('You can start anywhere')
    expect(html).toContain('A premise')
    expect(html).toContain('Fragments are saved as the conversation develops')
    expect(html).toContain('Open story')
    expect(html).toContain('Story checklist')
    expect(html).toContain('Starting point')
    expect(html).toContain('What it is about')
    expect(html).toContain('Characters')
    expect(html).toContain('Goal and stakes')
    expect(html).toContain('Setting')
    expect(html).toContain('Voice and tone')
    expect(html).toContain('Opening direction')
    expect(html).toContain('Story fragments')
    expect(html).toContain('Fragments will appear here as the idea takes shape')
    expect(html).toContain('data-component-id="story-setup-composer-column"')
    expect(html).not.toContain('Begin your story')
    expect(html).not.toContain('Step 1 of')
    expect(html).not.toContain('Create story')
  })

  it('does not send a prompt automatically on mount and only sends when the user submits one', async () => {
    const chatSpy = vi.spyOn(api.storySetup, 'chat').mockResolvedValue(
      new ReadableStream({
        start(controller) {
          controller.close()
        },
      }),
    )

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    const { getByText } = render(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(StoryWizard, {
          storyId: 'story-no-auto-prompt',
          onComplete: () => undefined,
        }),
      ),
    )

    expect(chatSpy).not.toHaveBeenCalled()

    fireEvent.click(getByText('A premise'))

    await waitFor(() => {
      expect(chatSpy).toHaveBeenCalledTimes(1)
    })
    expect(chatSpy).toHaveBeenCalledWith(
      'story-no-auto-prompt',
      [{ role: 'user', content: 'I have a premise, but it is still rough.' }],
      expect.any(AbortSignal),
    )
  })
})
