# Why does Luxon exist?

What's the deal with this whole Luxon thing anyway? Why did I write it? How is it related to the Moment project? What's different about it? This page tries to hash all that out.

## A disclaimer

I should clarify here that I'm just one of Moment's maintainers; I'm not in charge and I'm not Moment's creator. The opinions here are solely mine. Finally, none of this is meant to bash Moment, a project I've spent a lot of time on and whose other developers I respect.

## Origin

Luxon started because I had a bunch of ideas on how to improve Moment but kept finding Moment wasn't a good codebase to explore them with. Namely:

- I wanted to try out some ideas that I thought would provide a better, more explicit API but didn't want to break everything in Moment.
- I had an idea on how to provide out-of-the-box, no-data-files-required support for time zones, but Moment's design made that difficult.
- I wanted to completely rethink how internationalization worked by using the Intl API that comes packaged in browsers.
- I wanted to use a modern JS toolchain, which would require a major retrofit to Moment.

So I decided to write something from scratch, a sort of modernized Moment. It's a combination of all the things I learned maintaining Moment and Twix, plus a bunch of fresh ideas. I worked on it in little slivers of spare time for about two years. But now it's ready to actually use, and the Moment team likes it enough that we pulled it under the organization's umbrella.

## Ideas in Luxon

Luxon is built around a few core ideas:

1.  Keep the basic chainable date wrapper idea from Moment.
1.  Make all the types immutable.
1.  Make the API explicit; different methods do different things and have well-defined options.
1.  Use the Intl API to provide internationalization, including token parsing. Fall back to English if the browser doesn't support those APIs.
1.  Abuse the Intl API horribly to provide time zone support. Only possible for modern browsers.
1.  Provide more comprehensive duration support.
1.  Directly provide interval support.
1.  Write inline docs for everything.

These ideas have some big advantages:

1.  It's much easier to understand and debug code that uses Luxon.
1.  Using native browser capabilities for internationalization leads to a much better behavior and is dramatically easier to maintain.
1.  Luxon has the best time zone support of any JS date library.
1.  Luxon's durations are both flexible and easy to use.
1.  The documentation is very good.

They also have some disadvantages:

1.  Using modern browser capabilities means that the fallback behavior introduces complexity for the programmer.
1.  Never keeping internationalized strings in the code base means that some capabilities have to wait until the browsers provide it.
1.  Some aspects of the Intl API are browser-dependent, which means Luxon's behavior is too.

## Place in the Moment project

Luxon lives in the Moment project because, basically, we all really like it, and it represents a huge improvement.

But Luxon doesn't quite fulfill Moment's mandate. Since it sometimes relies on browsers' implementations of the `Intl` specifications, it doesn't provide some of Moment's most commonly-used features on all browsers. Relative date formatting is for instance not supported in IE11 and Safari (as of August 2020). Luxon's Intl features do not work as expected on sufficiently outdated browsers, whereas Moment's all work everywhere. That represents a good tradeoff, IMO, but it's clearly a different one than Moment makes.

Luxon makes a major break in API conventions. Part of Moment's charm is that you just call `moment()` on basically anything and you get date, whereas Luxon forces you to decide that you want to call `fromISO` or whatever. The upshot of all that is that Luxon feels like a different library; that's why it's not Moment 3.0.

So what is it then? We're not really sure. We're calling it a Moment labs project. Will its ideas get backported into Moment 3? Will it gradually siphon users away from Moment and become the focus of the Moment project? Will the march of modern browsers retire the arguments above and cause us to revisit branding Luxon as Moment? We don't know.

There, now you know as much as I do.

## Future plans

Luxon is fully usable and I plan to support it indefinitely. It's also largely complete. Luxon will eventually strip out its fallbacks for missing platform features. But overall I expect the core functionality to stay basically as it is, adding mostly minor tweaks and bugfixes.
