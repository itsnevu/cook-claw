/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { handle } from 'frog/next'

const app = new Frog({
    basePath: '/api/frame',
    title: 'ClawCook',
    // Supply a Hub to enable verification.
    // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

app.frame('/', (c) => {
    return c.res({
        action: '/roast',
        image: (
            <div
                style={{
                    alignItems: 'center',
                    background: 'linear-gradient(to right, #0D0D0D, #1a1a1a)',
                    backgroundSize: '100% 100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    height: '100%',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        color: '#FF4500',
                        fontSize: 60,
                        fontStyle: 'normal',
                        letterSpacing: '-0.025em',
                        lineHeight: 1.4,
                        marginTop: 30,
                        padding: '0 120px',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    ClawCook
                </div>
                <div
                    style={{
                        color: 'white',
                        fontSize: 30,
                        fontStyle: 'normal',
                        letterSpacing: '-0.025em',
                        marginTop: 10,
                        padding: '0 120px',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    The Roast-to-Earn Clawbot
                </div>
            </div>
        ),
        intents: [
            <Button key="roast-me" value="roast">Roast Me</Button>,
        ],
    })
})

app.frame('/roast', (c) => {
    return c.res({
        image: (
            <div
                style={{
                    alignItems: 'center',
                    background: 'linear-gradient(to right, #0D0D0D, #432818)',
                    backgroundSize: '100% 100%',
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    height: '100%',
                    justifyContent: 'center',
                    textAlign: 'center',
                    width: '100%',
                }}
            >
                <div
                    style={{
                        color: '#FF0000',
                        fontSize: 50,
                        fontStyle: 'normal',
                        letterSpacing: '-0.025em',
                        lineHeight: 1.4,
                        marginTop: 30,
                        padding: '0 120px',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    Analyzing Profile...
                </div>
                <div
                    style={{
                        color: 'white',
                        fontSize: 24,
                        marginTop: 20
                    }}
                >
                    (Glitch Animation Placeholder)
                </div>
            </div>
        ),
        intents: [
            <Button.Reset key="try-again">Try Again</Button.Reset>
        ]
    })
})

export const GET = handle(app)
export const POST = handle(app)
