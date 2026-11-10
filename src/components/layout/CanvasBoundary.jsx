import { Component } from 'react'

/**
 * Catches WebGL/scene errors so a GPU failure never takes down the CV.
 * Renders `fallback` instead of the canvas.
 */
export default class CanvasBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    console.warn('[3D] Scene disabled, showing static fallback:', error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
