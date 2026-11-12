# mui-look

The parts of MUI's look that the synstate-dom apps here share: the markup and
the behavior of each part, with the look left to the app that draws it, since
the apps follow different MUI versions and variants. Private; imported from
source by its siblings.

- `MuiTabs`: MUI's `Tabs` without the ripple. Only the selected tab is in the
  tab order, the arrow keys, Home and End move the focus between the tabs, and
  Enter or Space selects one. The app passes its CSS module as `classes`.
