# Ghost plug for Silver Bullet

Note: Still very basic, to use:

In your `SETTINGS` specify the following settings:

        ```yaml
        ghostUrl: https://your-ghost-blog.ghost.io
        ghostPostPrefix: posts
        ghostPagePrefix: pages
        ```

And in your `SECRETS` file:

        ```yaml
        ghostAdminKey: your:adminkey
        ```

This will assume the naming pattern of `posts/my-post-slug` where the first top-level heading (`# Hello`) will be used as the post title.

Commands to use `Ghost: Publish`

## Installation
Open your `PLUGS` note in SilverBullet and add this plug to the list:

```
- github:silverbulletmd/silverbullet-ghost/ghost.plug.json
```

Then run the `Plugs: Update` command and off you go!