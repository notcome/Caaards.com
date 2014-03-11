--[[
  addWord.lua (word star) (notes)
  1. check the existence of word
]]-- 

if redis.pcall('EXISTS', KEYS[1]) then
  return false
end

return {
  redis.pcall('SET', KEYS[1], ARGV[1]),
  redis.pcall('INCR', KEYS[2])
}
