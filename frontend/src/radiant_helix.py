import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation

# Create spiral (helix) data
theta = np.linspace(0, 4 * np.pi, 200)
z = np.linspace(0, 1, 200)
r = z * 10
x = r * np.sin(theta)
y = r * np.cos(theta)

fig, ax = plt.subplots(figsize=(6, 6), subplot_kw={'projection':'polar'})
line, = ax.plot([], [], lw=5)

def init():
    ax.set_ylim(0, 10)
    ax.set_xticks([])
    ax.set_yticks([])
    return line,

def animate(i):
    # Animate color and spiral
    color = plt.cm.plasma(i / 100)
    line.set_data(theta[:i], r[:i])
    line.set_color(color)
    return line,

ani = animation.FuncAnimation(
    fig, animate, frames=len(theta), init_func=init,
    interval=30, blit=True, repeat=True)

plt.title('Radiant Helix (SmartBin+ Visual)', fontsize=16)
plt.show()
