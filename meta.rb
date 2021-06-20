#!/usr/bin/env ruby

require 'json'
require 'metainspector'
require 'uri'
require "down"
require 'fileutils'

file = File.read('./src/scripts/data.json')
data_hash = JSON.parse(file)


FileUtils.rm_rf("./public/images/articles/.", secure: true)

["darmanin", "lepen"].each do |name|
  data_hash[name].each do |k, v|
    if k["source_type"] == "article"
      page = MetaInspector.new(k["source"], headers: {'User-Agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4514.0 Safari/537.36 Edg/92.0.902.4'})

      k['source_title'] = page.best_title
      k['source_description'] = page.meta['og:description']

      filename = rand(10_000).to_s + File.extname(page.meta['og:image']).split("?")[0]
      Down.download(page.meta['og:image'], destination: "./public/images/articles/#{filename}")
      k['source_image'] = "images/articles/#{filename}"
    end
  end
end

File.write('./src/scripts/data.json', JSON.pretty_generate(data_hash))
